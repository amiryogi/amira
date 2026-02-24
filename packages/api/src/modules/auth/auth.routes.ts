import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { authRateLimiter } from '../../middlewares/rateLimiter.js';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.validation.js';

const router = Router();

router.post('/register', authRateLimiter, validateRequest(registerSchema), AuthController.register);
router.post('/login', authRateLimiter, validateRequest(loginSchema), AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);
router.post('/forgot-password', authRateLimiter, validateRequest(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', authRateLimiter, validateRequest(resetPasswordSchema), AuthController.resetPassword);

export { router as authRoutes };
