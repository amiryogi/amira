import type { INotification } from '@amira/shared';

export type NotificationResponseDTO = INotification;

export interface SendEmailDTO {
  to: string;
  subject: string;
  html: string;
}
