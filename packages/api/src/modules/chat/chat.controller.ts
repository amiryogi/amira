import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../common/responseFormatter.js';
import { cloudinary } from '../../config/cloudinary.js';
import { ApiError } from '../../common/ApiError.js';

export class ChatController {
  /**
   * POST /api/v1/chat/upload
   * Upload a single chat attachment image to Cloudinary.
   */
  static uploadAttachment = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const file = req.file;
      if (!file) {
        throw ApiError.badRequest('No file provided');
      }

      const { config } = await import('../../config/index.js');
      if (!config.cloudinary.cloudName || !config.cloudinary.apiKey) {
        console.warn('⚠️  Cloudinary not configured — returning placeholder');
        sendResponse(res, 200, 'Attachment uploaded (placeholder)', {
          type: 'image',
          url: `/placeholder-${file.originalname}`,
        });
        return;
      }

      const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'amira/chat',
            transformation: [
              {
                width: 1024,
                height: 1024,
                crop: 'limit',
                quality: 'auto:good',
                format: 'webp',
              },
            ],
          },
          (error, result) => {
            if (error || !result) return reject(error || new Error('Upload failed'));
            resolve(result);
          },
        );
        stream.end(file.buffer);
      });

      sendResponse(res, 200, 'Attachment uploaded', {
        type: 'image',
        url: result.secure_url,
      });
    },
  );
}
