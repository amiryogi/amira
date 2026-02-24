import { Router } from 'express';
import { PaymentController } from './payment.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../middlewares/role.middleware.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { validateObjectId } from '../../middlewares/validateObjectId.js';
import { paymentRateLimiter } from '../../middlewares/rateLimiter.js';
import { esewaCreateSchema, esewaVerifySchema } from './payment.validation.js';
import { UserRole } from '@amira/shared';

const router = Router();

router.use(authMiddleware);

// User routes — eSewa
router.post(
  '/esewa/create',
  paymentRateLimiter,
  validateRequest(esewaCreateSchema),
  PaymentController.createEsewa,
);
router.post(
  '/esewa/verify',
  paymentRateLimiter,
  validateRequest(esewaVerifySchema),
  PaymentController.verifyEsewa,
);

// Admin routes
router.get(
  '/',
  roleMiddleware(UserRole.ADMIN),
  PaymentController.list,
);
router.get(
  '/:id',
  roleMiddleware(UserRole.ADMIN),
  validateObjectId(),
  PaymentController.getById,
);

export { router as paymentRoutes };
