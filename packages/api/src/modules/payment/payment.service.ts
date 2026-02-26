import crypto from 'crypto';
import mongoose from 'mongoose';
import { PaymentRepository } from './payment.repository.js';
import { OrderRepository } from '../order/order.repository.js';
import { ApiError } from '../../common/ApiError.js';
import { buildPagination, buildPaginationMeta } from '../../utils/pagination.js';
import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';
import { PaymentMethod, PaymentStatus, OrderStatus } from '@amira/shared';
import type { IPayment } from '@amira/shared';
import type { IPaymentDocument } from './payment.model.js';
import type { EsewaPaymentRequestDTO, PaymentListQueryDTO } from './payment.dto.js';

export class PaymentService {
  private paymentRepo: PaymentRepository;
  private orderRepo: OrderRepository;

  constructor() {
    this.paymentRepo = new PaymentRepository();
    this.orderRepo = new OrderRepository();
  }

  // ─── eSewa: Generate payment request ───
  async createEsewaPayment(orderId: string, userId: string): Promise<EsewaPaymentRequestDTO> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    // Handle populated userId (findById populates userId with user document)
    const orderUserId =
      typeof order.userId === 'object' && order.userId !== null && '_id' in order.userId
        ? (order.userId as unknown as { _id: { toString(): string } })._id.toString()
        : order.userId.toString();

    if (orderUserId !== userId.toString()) {
      throw ApiError.forbidden('You can only pay for your own orders');
    }
    if (order.paymentMethod !== PaymentMethod.ESEWA) {
      throw ApiError.badRequest('This order is not configured for eSewa payment');
    }
    if (order.paymentStatus === PaymentStatus.PAID) {
      throw ApiError.badRequest('Order is already paid');
    }

    // Check for existing pending payment
    const existingPayment = await this.paymentRepo.findByOrderId(orderId);
    if (existingPayment && existingPayment.status === PaymentStatus.PAID) {
      throw ApiError.badRequest('Payment already completed for this order');
    }

    const transactionUuid = `AMIRA-${orderId}-${Date.now()}`;
    const amount = order.totalAmount;
    const taxAmount = 0;
    const productServiceCharge = 0;
    const productDeliveryCharge = 0;
    const totalAmount = amount + taxAmount + productServiceCharge + productDeliveryCharge;

    // Create payment record
    await this.paymentRepo.create({
      orderId: order._id as mongoose.Types.ObjectId,
      userId: new mongoose.Types.ObjectId(userId),
      paymentMethod: PaymentMethod.ESEWA,
      transactionId: transactionUuid,
      amount: totalAmount,
      status: PaymentStatus.PENDING,
    });

    // Generate HMAC SHA256 signature
    const signedFieldNames = 'total_amount,transaction_uuid,product_code';
    const signatureString = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${config.esewa.productCode}`;
    const signature = crypto
      .createHmac('sha256', config.esewa.secret)
      .update(signatureString)
      .digest('base64');

    return {
      amount,
      taxAmount,
      totalAmount,
      transactionUuid,
      productCode: config.esewa.productCode,
      productServiceCharge,
      productDeliveryCharge,
      successUrl: `${config.frontendUrl}/payment/success`,
      failureUrl: `${config.frontendUrl}/payment/failure`,
      signedFieldNames,
      signature,
    };
  }

  // ─── eSewa: Verify payment callback ───
  async verifyEsewaPayment(encodedData: string, userId: string): Promise<IPayment> {
    // Decode base64 response from eSewa
    const decodedString = Buffer.from(encodedData, 'base64').toString('utf-8');
    let esewaResponse: Record<string, string>;

    try {
      esewaResponse = JSON.parse(decodedString);
    } catch {
      throw ApiError.badRequest('Invalid eSewa response data');
    }

    const {
      transaction_uuid: transactionUuid,
      total_amount: totalAmountStr,
      transaction_code: transactionCode,
      status,
      signed_field_names: signedFieldNames,
      signature: receivedSignature,
    } = esewaResponse;

    if (!transactionUuid || !totalAmountStr || !status) {
      throw ApiError.badRequest('Missing required eSewa response fields');
    }

    // Verify signature
    if (signedFieldNames && receivedSignature) {
      const fields = signedFieldNames.split(',');
      const signatureString = fields
        .map((field) => `${field}=${esewaResponse[field]}`)
        .join(',');
      const expectedSignature = crypto
        .createHmac('sha256', config.esewa.secret)
        .update(signatureString)
        .digest('base64');

      if (expectedSignature !== receivedSignature) {
        logger.warn({ transactionUuid }, 'eSewa signature mismatch — possible fraud');
        throw ApiError.badRequest('Signature verification failed');
      }
    }

    // Find payment record
    const payment = await this.paymentRepo.findByTransactionId(transactionUuid);
    if (!payment) {
      throw ApiError.notFound('Payment record not found');
    }

    // Idempotency: already verified
    if (payment.status === PaymentStatus.PAID) {
      return this.toPayment(payment);
    }

    // Verify ownership
    if (payment.userId.toString() !== userId.toString()) {
      logger.warn({ transactionUuid, userId }, 'Payment ownership mismatch');
      throw ApiError.forbidden('Payment does not belong to you');
    }

    // Verify amount
    const totalAmount = parseFloat(totalAmountStr.replace(/,/g, ''));
    if (Math.abs(totalAmount - payment.amount) > 0.01) {
      logger.warn({ transactionUuid, expected: payment.amount, received: totalAmount }, 'Amount mismatch');
      await this.paymentRepo.updateStatus(payment._id as string, PaymentStatus.FAILED, {
        rawResponse: esewaResponse as unknown as Record<string, unknown>,
        failureReason: `Amount mismatch: expected ${payment.amount}, got ${totalAmount}`,
      });
      throw ApiError.badRequest('Payment amount mismatch');
    }

    // Start DB transaction for atomic order + payment update
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      if (status === 'COMPLETE') {
        await this.paymentRepo.updateStatus(
          payment._id as string,
          PaymentStatus.PAID,
          {
            rawResponse: esewaResponse as unknown as Record<string, unknown>,
            verifiedAt: new Date(),
          },
          session,
        );

        await this.orderRepo.updateStatus(payment.orderId.toString(), {
          paymentStatus: PaymentStatus.PAID,
          orderStatus: OrderStatus.CONFIRMED,
          transactionId: transactionCode || transactionUuid,
        });
      } else {
        await this.paymentRepo.updateStatus(
          payment._id as string,
          PaymentStatus.FAILED,
          {
            rawResponse: esewaResponse as unknown as Record<string, unknown>,
            failureReason: `eSewa status: ${status}`,
          },
          session,
        );
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    const updatedPayment = await this.paymentRepo.findByTransactionId(transactionUuid);
    if (!updatedPayment) throw ApiError.internal('Payment not found after update');
    return this.toPayment(updatedPayment);
  }

  // ─── Admin: List payments ───
  async listPayments(query: PaymentListQueryDTO) {
    const { skip, limit, sort, page } = buildPagination(query);

    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.paymentMethod) filter.paymentMethod = query.paymentMethod;
    if (query.transactionId) filter.transactionId = { $regex: query.transactionId, $options: 'i' };

    const [payments, total] = await Promise.all([
      this.paymentRepo.findPaginated(filter, sort, skip, limit),
      this.paymentRepo.count(filter),
    ]);

    return {
      data: payments.map(this.toPayment),
      pagination: buildPaginationMeta(total, page, limit),
    };
  }

  async getPaymentById(id: string): Promise<IPayment> {
    const payment = await this.paymentRepo.findById(id);
    if (!payment) throw ApiError.notFound('Payment not found');
    return this.toPayment(payment);
  }

  private toPayment(doc: IPaymentDocument): IPayment {
    return {
      _id: doc._id as string,
      orderId: doc.orderId.toString(),
      userId: doc.userId.toString(),
      paymentMethod: doc.paymentMethod,
      transactionId: doc.transactionId,
      amount: doc.amount,
      status: doc.status,
      rawResponse: doc.rawResponse,
      failureReason: doc.failureReason,
      verifiedAt: doc.verifiedAt?.toISOString(),
      createdAt: doc.createdAt.toISOString(),
    };
  }
}
