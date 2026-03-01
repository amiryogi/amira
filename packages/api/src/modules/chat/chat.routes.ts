import { Router } from 'express';
import { ChatController } from './chat.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { upload } from '../../middlewares/upload.js';

const router = Router();

// POST /api/v1/chat/upload — upload chat image attachment
router.post(
  '/upload',
  authMiddleware,
  upload.single('image'),
  ChatController.uploadAttachment,
);

export { router as chatRoutes };
