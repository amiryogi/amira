import mongoose from 'mongoose';
import { NotificationRepository } from './notification.repository.js';
import { EmailService } from './email.service.js';
import { buildPagination, buildPaginationMeta } from '../../utils/pagination.js';
import { logger } from '../../utils/logger.js';
import {
  NotificationType,
  NotificationChannel,
  NotificationStatus,
} from '@amira/shared';
import type { INotification, PaginationParams } from '@amira/shared';
import type { INotificationDocument } from './notification.model.js';

export class NotificationService {
  private notificationRepo: NotificationRepository;
  private emailService: EmailService;

  constructor() {
    this.notificationRepo = new NotificationRepository();
    this.emailService = new EmailService();
  }

  // ─── Send notification (non-blocking) ───
  async sendNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    email: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    // Fire and forget — don't block the calling process
    this.sendAsync(userId, type, title, message, email, metadata).catch((err) => {
      logger.error({ err, userId, type }, 'Failed to send notification');
    });
  }

  private async sendAsync(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    email: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    const notification = await this.notificationRepo.create({
      userId: new mongoose.Types.ObjectId(userId),
      type,
      title,
      message,
      channel: NotificationChannel.EMAIL,
      status: NotificationStatus.PENDING,
      metadata,
    } as Partial<INotificationDocument>);

    // Build email content based on type
    let emailContent: { subject: string; html: string };

    switch (type) {
      case NotificationType.WELCOME:
        emailContent = this.emailService.welcomeEmail(title);
        break;
      case NotificationType.ORDER_CONFIRMATION:
        emailContent = this.emailService.orderConfirmationEmail(
          metadata?.orderId as string,
          metadata?.totalAmount as number,
        );
        break;
      case NotificationType.STATUS_UPDATE:
        emailContent = this.emailService.orderStatusEmail(
          metadata?.orderId as string,
          metadata?.status as string,
        );
        break;
      case NotificationType.PAYMENT_SUCCESS:
        emailContent = this.emailService.paymentSuccessEmail(
          metadata?.orderId as string,
          metadata?.amount as number,
        );
        break;
      case NotificationType.PAYMENT_FAILURE:
        emailContent = this.emailService.paymentFailedEmail(metadata?.orderId as string);
        break;
      case NotificationType.PASSWORD_RESET:
        emailContent = this.emailService.passwordResetEmail(metadata?.resetUrl as string);
        break;
      default:
        emailContent = { subject: title, html: `<p>${message}</p>` };
    }

    const sent = await this.emailService.sendEmail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    await this.notificationRepo.updateStatus(
      notification._id as string,
      sent ? NotificationStatus.SENT : NotificationStatus.FAILED,
      sent ? new Date() : undefined,
    );
  }

  // ─── User: Get my notifications ───
  async getUserNotifications(userId: string, query: PaginationParams) {
    const { skip, limit, sort, page } = buildPagination({ ...query, sort: 'createdAt' });

    const [notifications, total] = await Promise.all([
      this.notificationRepo.findByUser(userId, sort, skip, limit),
      this.notificationRepo.countByUser(userId),
    ]);

    return {
      data: notifications.map(this.toNotification),
      pagination: buildPaginationMeta(total, page, limit),
    };
  }

  // ─── Admin: List all notifications ───
  async adminListNotifications(query: PaginationParams & { type?: string; status?: string }) {
    const { skip, limit, sort, page } = buildPagination(query);

    const filter: Record<string, unknown> = {};
    if (query.type) filter.type = query.type;
    if (query.status) filter.status = query.status;

    const [notifications, total] = await Promise.all([
      this.notificationRepo.findPaginated(filter, sort, skip, limit),
      this.notificationRepo.count(filter),
    ]);

    return {
      data: notifications.map(this.toNotification),
      pagination: buildPaginationMeta(total, page, limit),
    };
  }

  private toNotification(doc: INotificationDocument): INotification & { user?: { name: string; email: string } } {
    const populatedUser = typeof doc.userId === 'object' && doc.userId !== null && 'email' in doc.userId
      ? doc.userId as unknown as { _id: { toString(): string }; name: string; email: string }
      : null;

    return {
      _id: doc._id as string,
      userId: populatedUser ? populatedUser._id.toString() : doc.userId.toString(),
      ...(populatedUser && { user: { name: populatedUser.name, email: populatedUser.email } }),
      type: doc.type,
      title: doc.title,
      message: doc.message,
      channel: doc.channel,
      status: doc.status,
      metadata: doc.metadata,
      sentAt: doc.sentAt?.toISOString(),
      createdAt: doc.createdAt.toISOString(),
    };
  }
}
