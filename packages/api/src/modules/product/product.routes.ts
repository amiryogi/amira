import { Router } from 'express';
import { ProductController } from './product.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../middlewares/role.middleware.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { validateObjectId } from '../../middlewares/validateObjectId.js';
import { createProductSchema, updateProductSchema } from './product.validation.js';
import { upload } from '../../middlewares/upload.js';
import { UserRole } from '@amira/shared';

const router = Router();

// Public routes
router.get('/', ProductController.list);
router.get('/slug/:slug', ProductController.getBySlug);
router.get('/:id', validateObjectId(), ProductController.getById);

// Admin-only routes
router.get(
  '/admin/all',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  ProductController.adminList,
);
router.post(
  '/',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  upload.array('images', 5),
  validateRequest(createProductSchema),
  ProductController.create,
);
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  validateObjectId(),
  upload.array('images', 5),
  validateRequest(updateProductSchema),
  ProductController.update,
);
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  validateObjectId(),
  ProductController.delete,
);

export { router as productRoutes };
