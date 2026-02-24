import { Router } from 'express';
import { CategoryController } from './category.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../middlewares/role.middleware.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { validateObjectId } from '../../middlewares/validateObjectId.js';
import { createCategorySchema, updateCategorySchema } from './category.validation.js';
import { UserRole } from '@amira/shared';

const router = Router();

// Public routes
router.get('/', CategoryController.list);
router.get('/active', CategoryController.getAllActive);
router.get('/:slug', CategoryController.getBySlug);

// Admin-only routes
router.post(
  '/',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  validateRequest(createCategorySchema),
  CategoryController.create,
);
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  validateObjectId(),
  validateRequest(updateCategorySchema),
  CategoryController.update,
);
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  validateObjectId(),
  CategoryController.delete,
);

export { router as categoryRoutes };
