import mongoose from 'mongoose';
import { Payment, IPaymentDocument } from '../../modules/payment/payment.model.js';
import { PaymentMethod, PaymentStatus } from '@amira/shared';
import { createTestOrder } from './order.factory.js';
import { createTestUser } from './user.factory.js';

interface CreatePaymentOverrides {
  orderId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  amount?: number;
  status?: PaymentStatus;
  rawResponse?: Record<string, unknown>;
  failureReason?: string;
  verifiedAt?: Date;
}

let paymentCounter = 0;

export async function createTestPayment(
  overrides: CreatePaymentOverrides = {},
): Promise<IPaymentDocument> {
  paymentCounter++;

  let orderId = overrides.orderId;
  let userId = overrides.userId;

  if (!orderId || !userId) {
    const user = await createTestUser();
    userId = userId ?? (user._id as mongoose.Types.ObjectId);
    const order = await createTestOrder({ userId });
    orderId = orderId ?? (order._id as mongoose.Types.ObjectId);
  }

  return Payment.create({
    orderId,
    userId,
    paymentMethod: overrides.paymentMethod ?? PaymentMethod.ESEWA,
    transactionId: overrides.transactionId ?? `AMIRA-TEST-${Date.now()}-${paymentCounter}`,
    amount: overrides.amount ?? 5000,
    status: overrides.status ?? PaymentStatus.PENDING,
    rawResponse: overrides.rawResponse,
    failureReason: overrides.failureReason,
    verifiedAt: overrides.verifiedAt,
  });
}

export async function createTestPayments(
  count: number,
  overrides: CreatePaymentOverrides = {},
): Promise<IPaymentDocument[]> {
  const payments: IPaymentDocument[] = [];
  for (let i = 0; i < count; i++) {
    payments.push(await createTestPayment(overrides));
  }
  return payments;
}

export function resetPaymentCounter(): void {
  paymentCounter = 0;
}
