import { Order, IOrderDocument } from './order.model.js';
import mongoose from 'mongoose';

export class OrderRepository {
  async create(data: Partial<IOrderDocument>, session?: mongoose.ClientSession): Promise<IOrderDocument> {
    const [order] = await Order.create([data], { session });
    return order;
  }

  async findById(id: string): Promise<IOrderDocument | null> {
    return Order.findById(id).populate('userId', 'name email phone');
  }

  async findByUser(
    userId: string,
    sort: Record<string, 1 | -1>,
    skip: number,
    limit: number,
  ): Promise<IOrderDocument[]> {
    return Order.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async countByUser(userId: string): Promise<number> {
    return Order.countDocuments({ userId: new mongoose.Types.ObjectId(userId) });
  }

  async findPaginated(
    filter: Record<string, unknown>,
    sort: Record<string, 1 | -1>,
    skip: number,
    limit: number,
  ): Promise<IOrderDocument[]> {
    return Order.find(filter)
      .populate('userId', 'name email phone')
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async count(filter: Record<string, unknown> = {}): Promise<number> {
    return Order.countDocuments(filter);
  }

  async updateStatus(
    id: string,
    updates: Partial<Pick<IOrderDocument, 'orderStatus' | 'paymentStatus' | 'transactionId'>>,
  ): Promise<IOrderDocument | null> {
    return Order.findByIdAndUpdate(id, updates, { new: true })
      .populate('userId', 'name email phone');
  }

  async findRecentByUser(userId: string, limit: number): Promise<IOrderDocument[]> {
    return Order.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}
