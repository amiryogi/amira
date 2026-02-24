import { Request, Response } from 'express';
import { OrderService } from './order.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse, sendPaginatedResponse } from '../../common/responseFormatter.js';
import { UserRole } from '@amira/shared';

const orderService = new OrderService();

export class OrderController {
  static create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const order = await orderService.createOrder(req.user!._id as string, req.body);
    sendResponse(res, 201, 'Order created', order);
  });

  static getUserOrders = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await orderService.getUserOrders(
      req.user!._id as string,
      req.query as Record<string, string>,
    );
    sendPaginatedResponse(res, 'Orders retrieved', result.data, result.pagination);
  });

  static getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const isAdmin = req.user!.role === UserRole.ADMIN;
    const order = await orderService.getOrderById(req.params.id, req.user!._id as string, isAdmin);
    sendResponse(res, 200, 'Order retrieved', order);
  });

  static listAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await orderService.listAllOrders(req.query as Record<string, string>);
    sendPaginatedResponse(res, 'Orders retrieved', result.data, result.pagination);
  });

  static updateStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const order = await orderService.updateOrderStatus(req.params.id, req.body);
    sendResponse(res, 200, 'Order status updated', order);
  });
}
