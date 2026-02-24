import { Payment, IPaymentDocument } from './payment.model.js';
import mongoose from 'mongoose';

export class PaymentRepository {
  async create(data: Partial<IPaymentDocument>, session?: mongoose.ClientSession): Promise<IPaymentDocument> {
    const [payment] = await Payment.create([data], { session });
    return payment;
  }

  async findById(id: string): Promise<IPaymentDocument | null> {
    return Payment.findById(id);
  }

  async findByTransactionId(transactionId: string): Promise<IPaymentDocument | null> {
    return Payment.findOne({ transactionId });
  }

  async findByOrderId(orderId: string): Promise<IPaymentDocument | null> {
    return Payment.findOne({ orderId: new mongoose.Types.ObjectId(orderId) });
  }

  async findPaginated(
    filter: Record<string, unknown>,
    sort: Record<string, 1 | -1>,
    skip: number,
    limit: number,
  ): Promise<IPaymentDocument[]> {
    return Payment.find(filter).sort(sort).skip(skip).limit(limit);
  }

  async count(filter: Record<string, unknown> = {}): Promise<number> {
    return Payment.countDocuments(filter);
  }

  async updateStatus(
    id: string,
    status: string,
    updates: Partial<IPaymentDocument>,
    session?: mongoose.ClientSession,
  ): Promise<IPaymentDocument | null> {
    return Payment.findByIdAndUpdate(id, { status, ...updates }, { new: true, session });
  }

  async aggregateRevenue(match: Record<string, unknown>): Promise<Array<{ _id: string; total: number; count: number }>> {
    return Payment.aggregate([
      { $match: { status: 'PAID', ...match } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);
  }

  async aggregateByMethod(): Promise<Array<{ _id: string; total: number; count: number }>> {
    return Payment.aggregate([
      { $match: { status: 'PAID' } },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);
  }
}
