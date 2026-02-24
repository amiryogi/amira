import { Router } from 'express';
import { AnalyticsController } from './analytics.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../middlewares/role.middleware.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { revenueQuerySchema, topProductsQuerySchema } from './analytics.validation.js';
import { UserRole } from '@amira/shared';

const router = Router();

// All analytics routes are admin-only
router.use(authMiddleware, roleMiddleware(UserRole.ADMIN));

router.get('/dashboard', AnalyticsController.dashboard);
router.get('/revenue', validateRequest(revenueQuerySchema, 'query'), AnalyticsController.revenue);
router.get('/top-products', validateRequest(topProductsQuerySchema, 'query'), AnalyticsController.topProducts);
router.get('/order-status', AnalyticsController.orderStatus);

export { router as analyticsRoutes };
