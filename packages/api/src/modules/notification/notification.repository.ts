import { Notification, INotificationDocument } from './notification.model.js';
import mongoose from 'mongoose';

export class NotificationRepository {
  async create(data: Partial<INotificationDocument>): Promise<INotificationDocument> {
    return Notification.create(data);
  }

  async findById(id: string): Promise<INotificationDocument | null> {
    return Notification.findById(id);
  }

  async findByUser(
    userId: string,
    sort: Record<string, 1 | -1>,
    skip: number,
    limit: number,
  ): Promise<INotificationDocument[]> {
    return Notification.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async countByUser(userId: string): Promise<number> {
    return Notification.countDocuments({ userId: new mongoose.Types.ObjectId(userId) });
  }

  async updateStatus(id: string, status: string, sentAt?: Date): Promise<INotificationDocument | null> {
    const update: Record<string, unknown> = { status };
    if (sentAt) update.sentAt = sentAt;
    return Notification.findByIdAndUpdate(id, update, { new: true });
  }

  async findPaginated(
    filter: Record<string, unknown>,
    sort: Record<string, 1 | -1>,
    skip: number,
    limit: number,
  ): Promise<INotificationDocument[]> {
    return Notification.find(filter).sort(sort).skip(skip).limit(limit);
  }

  async count(filter: Record<string, unknown> = {}): Promise<number> {
    return Notification.countDocuments(filter);
  }
}
