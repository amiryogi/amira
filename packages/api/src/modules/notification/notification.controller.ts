import { Request, Response } from 'express';
import { NotificationService } from './notification.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendPaginatedResponse } from '../../common/responseFormatter.js';

const notificationService = new NotificationService();

export class NotificationController {
  static getUserNotifications = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await notificationService.getUserNotifications(
      req.user!._id as string,
      req.query as Record<string, string>,
    );
    sendPaginatedResponse(res, 'Notifications retrieved', result.data, result.pagination);
  });

  static adminList = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await notificationService.adminListNotifications(
      req.query as Record<string, string>,
    );
    sendPaginatedResponse(res, 'Notifications retrieved', result.data, result.pagination);
  });
}
