import mongoose, { Schema, Document } from 'mongoose';
import { NotificationType, NotificationChannel, NotificationStatus } from '@amira/shared';

export interface INotificationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  metadata?: Record<string, unknown>;
  sentAt?: Date;
  createdAt: Date;
}

const notificationSchema = new Schema<INotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    channel: {
      type: String,
      enum: Object.values(NotificationChannel),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(NotificationStatus),
      default: NotificationStatus.PENDING,
      index: true,
    },
    metadata: { type: Schema.Types.Mixed },
    sentAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

notificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model<INotificationDocument>(
  'Notification',
  notificationSchema,
);
