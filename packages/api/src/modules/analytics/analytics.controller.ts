import { Request, Response } from 'express';
import { AnalyticsService } from './analytics.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../common/responseFormatter.js';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  static dashboard = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const summary = await analyticsService.getDashboard();
    sendResponse(res, 200, 'Dashboard data retrieved', summary);
  });

  static revenue = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const months = Number(req.query.months) || 12;
    const revenue = await analyticsService.getRevenue(months);
    sendResponse(res, 200, 'Revenue data retrieved', revenue);
  });

  static topProducts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const limit = Number(req.query.limit) || 10;
    const products = await analyticsService.getTopProducts(limit);
    sendResponse(res, 200, 'Top products retrieved', products);
  });

  static orderStatus = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const breakdown = await analyticsService.getOrderStatusBreakdown();
    sendResponse(res, 200, 'Order status breakdown', breakdown);
  });
}
