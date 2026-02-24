import { Router } from 'express';
import { UserController } from './user.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { roleMiddleware } from '../../middlewares/role.middleware.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { validateObjectId } from '../../middlewares/validateObjectId.js';
import { userProfileSchema } from './user.validation.js';
import { UserRole } from '@amira/shared';

const router = Router();

// Authenticated user routes
router.get('/profile', authMiddleware, UserController.getProfile);
router.put('/profile', authMiddleware, validateRequest(userProfileSchema), UserController.updateProfile);

// Admin routes
router.get('/', authMiddleware, roleMiddleware(UserRole.ADMIN), UserController.listUsers);
router.put('/:id/role', authMiddleware, roleMiddleware(UserRole.ADMIN), validateObjectId(), UserController.updateRole);
router.delete('/:id', authMiddleware, roleMiddleware(UserRole.ADMIN), validateObjectId(), UserController.deleteUser);

export { router as userRoutes };
