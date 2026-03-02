import { Request, Response } from 'express';
import { ReviewService } from './review.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse, sendPaginatedResponse } from '../../common/responseFormatter.js';
import { UserRole } from '@amira/shared';

const reviewService = new ReviewService();

export class ReviewController {
  static getByProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await reviewService.getProductReviews(
      req.params.productId as string,
      req.query as Record<string, string>,
    );
    sendPaginatedResponse(res, 'Reviews retrieved', result.data, result.pagination);
  });

  static create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const review = await reviewService.createReview(String(req.user!._id), req.body);
    sendResponse(res, 201, 'Review submitted for approval', review);
  });

  static delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const isAdmin = req.user!.role === UserRole.ADMIN;
    await reviewService.deleteReview(req.params.id as string, String(req.user!._id), isAdmin);
    sendResponse(res, 200, 'Review deleted');
  });

  static approve = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const review = await reviewService.approveReview(req.params.id as string);
    sendResponse(res, 200, 'Review approved', review);
  });

  static adminList = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await reviewService.adminListReviews(req.query as Record<string, string>);
    sendPaginatedResponse(res, 'Reviews retrieved', result.data, result.pagination);
  });
}
