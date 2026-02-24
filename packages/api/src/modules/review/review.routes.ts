import { Router } from 'express';
import { ReviewController } from './review.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../middlewares/role.middleware.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { validateObjectId } from '../../middlewares/validateObjectId.js';
import { createReviewSchema } from './review.validation.js';
import { UserRole } from '@amira/shared';

const router = Router();

// Public: get reviews by product
router.get('/product/:productId', ReviewController.getByProduct);

// Authenticated: create/delete review
router.post('/', authMiddleware, validateRequest(createReviewSchema), ReviewController.create);
router.delete('/:id', authMiddleware, validateObjectId(), ReviewController.delete);

// Admin: approve + list all
router.get(
  '/',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  ReviewController.adminList,
);
router.put(
  '/:id/approve',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  validateObjectId(),
  ReviewController.approve,
);

export { router as reviewRoutes };
