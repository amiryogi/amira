import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PaymentService } from '../payment.service.js';
import { createTestUser } from '../../../test/factories/user.factory.js';
import { createTestOrder } from '../../../test/factories/order.factory.js';
import { createTestProduct } from '../../../test/factories/product.factory.js';
import { PaymentMethod, PaymentStatus } from '@amira/shared';
import { Payment } from '../payment.model.js';
import mongoose from 'mongoose';

// Mock logger to suppress test output
vi.mock('../../../utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('PaymentService', () => {
  let paymentService: PaymentService;

  beforeEach(() => {
    paymentService = new PaymentService();
  });

  describe('createEsewaPayment', () => {
    it('should generate eSewa payment request for valid order', async () => {
      const user = await createTestUser();
      const userId = (user._id as mongoose.Types.ObjectId).toString();
      const product = await createTestProduct({ price: 2500 });

      const order = await createTestOrder({
        userId: user._id as mongoose.Types.ObjectId,
        paymentMethod: PaymentMethod.ESEWA,
        totalAmount: 5000,
        products: [
          {
            productId: product._id as mongoose.Types.ObjectId,
            name: product.name,
            price: 2500,
            quantity: 2,
          },
        ],
      });

      const result = await paymentService.createEsewaPayment(
        (order._id as mongoose.Types.ObjectId).toString(),
        userId,
      );

      expect(result.amount).toBe(5000);
      expect(result.totalAmount).toBe(5000);
      expect(result.transactionUuid).toContain('AMIRA-');
      expect(result.productCode).toBeDefined();
      expect(result.signature).toBeDefined();
      expect(result.successUrl).toContain('/payment/success');
      expect(result.failureUrl).toContain('/payment/failure');

      // Payment record should be created in DB
      const payments = await Payment.find({});
      expect(payments).toHaveLength(1);
      expect(payments[0].status).toBe(PaymentStatus.PENDING);
    });

    it('should throw error for already paid order', async () => {
      const user = await createTestUser();
      const userId = (user._id as mongoose.Types.ObjectId).toString();

      const order = await createTestOrder({
        userId: user._id as mongoose.Types.ObjectId,
        paymentMethod: PaymentMethod.ESEWA,
        paymentStatus: PaymentStatus.PAID,
      });

      await expect(
        paymentService.createEsewaPayment(
          (order._id as mongoose.Types.ObjectId).toString(),
          userId,
        ),
      ).rejects.toThrow('Order is already paid');
    });

    it('should throw error for COD order', async () => {
      const user = await createTestUser();
      const userId = (user._id as mongoose.Types.ObjectId).toString();

      const order = await createTestOrder({
        userId: user._id as mongoose.Types.ObjectId,
        paymentMethod: PaymentMethod.COD,
      });

      await expect(
        paymentService.createEsewaPayment(
          (order._id as mongoose.Types.ObjectId).toString(),
          userId,
        ),
      ).rejects.toThrow('not configured for eSewa');
    });

    it('should throw forbidden for different user', async () => {
      const owner = await createTestUser();
      const other = await createTestUser();

      const order = await createTestOrder({
        userId: owner._id as mongoose.Types.ObjectId,
        paymentMethod: PaymentMethod.ESEWA,
      });

      await expect(
        paymentService.createEsewaPayment(
          (order._id as mongoose.Types.ObjectId).toString(),
          (other._id as mongoose.Types.ObjectId).toString(),
        ),
      ).rejects.toThrow('You can only pay for your own orders');
    });

    it('should throw 404 for non-existent order', async () => {
      const user = await createTestUser();
      const fakeId = new mongoose.Types.ObjectId().toString();

      await expect(
        paymentService.createEsewaPayment(
          fakeId,
          (user._id as mongoose.Types.ObjectId).toString(),
        ),
      ).rejects.toThrow('Order not found');
    });
  });

  describe('listPayments', () => {
    it('should return paginated payments', async () => {
      const user = await createTestUser();
      const userId = user._id as mongoose.Types.ObjectId;

      // Create payment records directly
      const order1 = await createTestOrder({
        userId,
        paymentMethod: PaymentMethod.ESEWA,
      });
      const order2 = await createTestOrder({
        userId,
        paymentMethod: PaymentMethod.ESEWA,
      });

      await Payment.create({
        orderId: order1._id,
        userId,
        paymentMethod: PaymentMethod.ESEWA,
        transactionId: `AMIRA-TEST-1`,
        amount: 3000,
        status: PaymentStatus.PAID,
      });
      await Payment.create({
        orderId: order2._id,
        userId,
        paymentMethod: PaymentMethod.ESEWA,
        transactionId: `AMIRA-TEST-2`,
        amount: 5000,
        status: PaymentStatus.PENDING,
      });

      const result = await paymentService.listPayments({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });

    it('should filter payments by status', async () => {
      const user = await createTestUser();
      const userId = user._id as mongoose.Types.ObjectId;

      const order1 = await createTestOrder({ userId, paymentMethod: PaymentMethod.ESEWA });
      const order2 = await createTestOrder({ userId, paymentMethod: PaymentMethod.ESEWA });

      await Payment.create({
        orderId: order1._id,
        userId,
        paymentMethod: PaymentMethod.ESEWA,
        transactionId: `FILTER-1`,
        amount: 3000,
        status: PaymentStatus.PAID,
      });
      await Payment.create({
        orderId: order2._id,
        userId,
        paymentMethod: PaymentMethod.ESEWA,
        transactionId: `FILTER-2`,
        amount: 5000,
        status: PaymentStatus.FAILED,
      });

      const result = await paymentService.listPayments({
        page: 1,
        limit: 10,
        status: PaymentStatus.PAID,
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe(PaymentStatus.PAID);
    });
  });

  describe('getPaymentById', () => {
    it('should throw 404 for non-existent payment', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await expect(paymentService.getPaymentById(fakeId)).rejects.toThrow(
        'Payment not found',
      );
    });
  });
});
