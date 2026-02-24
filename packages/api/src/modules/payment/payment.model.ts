import mongoose, { Schema, Document } from 'mongoose';
import { PaymentMethod, PaymentStatus } from '@amira/shared';

export interface IPaymentDocument extends Document {
  orderId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  paymentMethod: PaymentMethod;
  transactionId: string;
  amount: number;
  status: PaymentStatus;
  rawResponse?: Record<string, unknown>;
  failureReason?: string;
  verifiedAt?: Date;
  createdAt: Date;
}

const paymentSchema = new Schema<IPaymentDocument>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    transactionId: { type: String, required: true, unique: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      index: true,
    },
    rawResponse: { type: Schema.Types.Mixed },
    failureReason: { type: String },
    verifiedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Payment = mongoose.model<IPaymentDocument>('Payment', paymentSchema);
