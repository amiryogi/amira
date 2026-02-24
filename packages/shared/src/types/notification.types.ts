import { NotificationType, NotificationChannel, NotificationStatus } from '../enums/notification.enum';

export interface INotification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  metadata?: Record<string, unknown>;
  sentAt?: string;
  createdAt: string;
}
