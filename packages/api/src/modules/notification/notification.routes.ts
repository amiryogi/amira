import { Router } from 'express';
import { NotificationController } from './notification.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../middlewares/role.middleware.js';
import { UserRole } from '@amira/shared';

const router = Router();

router.use(authMiddleware);

// User: get own notifications
router.get('/', NotificationController.getUserNotifications);

// Admin: list all notifications
router.get(
  '/admin/all',
  roleMiddleware(UserRole.ADMIN),
  NotificationController.adminList,
);

export { router as notificationRoutes };
