import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

export interface IPayment {
  _id: string;
  orderId: string;
  userId: string;
  paymentMethod: PaymentMethod;
  transactionId: string;
  amount: number;
  status: PaymentStatus;
  rawResponse?: Record<string, unknown>;
  failureReason?: string;
  verifiedAt?: string;
  createdAt: string;
}
