import { Request, Response } from 'express';
import { PaymentService } from './payment.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse, sendPaginatedResponse } from '../../common/responseFormatter.js';

const paymentService = new PaymentService();

export class PaymentController {
  static createEsewa = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const paymentData = await paymentService.createEsewaPayment(req.body.orderId, req.user!._id as string);
    sendResponse(res, 200, 'eSewa payment data generated', paymentData);
  });

  static verifyEsewa = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const payment = await paymentService.verifyEsewaPayment(req.body.data, req.user!._id as string);
    sendResponse(res, 200, 'Payment verified', payment);
  });

  static list = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await paymentService.listPayments(req.query as Record<string, string>);
    sendPaginatedResponse(res, 'Payments retrieved', result.data, result.pagination);
  });

  static getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const payment = await paymentService.getPaymentById(req.params.id);
    sendResponse(res, 200, 'Payment retrieved', payment);
  });
}
