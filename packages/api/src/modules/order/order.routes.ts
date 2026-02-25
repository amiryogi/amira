import { Router } from 'express';
import { OrderController } from './order.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../middlewares/role.middleware.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { validateObjectId } from '../../middlewares/validateObjectId.js';
import { createOrderSchema, updateOrderStatusSchema } from './order.validation.js';
import { UserRole } from '@amira/shared';

const router = Router();

router.use(authMiddleware);

// Admin routes (MUST be before /:id to avoid matching 'admin' as id)
router.get(
  '/admin/all',
  roleMiddleware(UserRole.ADMIN),
  OrderController.listAll,
);
router.put(
  '/:id/status',
  roleMiddleware(UserRole.ADMIN),
  validateObjectId(),
  validateRequest(updateOrderStatusSchema),
  OrderController.updateStatus,
);

// User routes
router.post('/', validateRequest(createOrderSchema), OrderController.create);
router.get('/', OrderController.getUserOrders);
router.get('/:id', validateObjectId(), OrderController.getById);

export { router as orderRoutes };
