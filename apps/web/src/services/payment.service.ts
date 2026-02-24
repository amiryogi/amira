import { api } from './api';
import type { ApiResponse, IPayment } from '@amira/shared';

interface EsewaPaymentData {
  amount: number;
  taxAmount: number;
  totalAmount: number;
  transactionUuid: string;
  productCode: string;
  productServiceCharge: number;
  productDeliveryCharge: number;
  successUrl: string;
  failureUrl: string;
  signedFieldNames: string;
  signature: string;
}

export const paymentService = {
  createEsewa: (orderId: string) =>
    api.post<ApiResponse<EsewaPaymentData>>('/payments/esewa/create', { orderId }),

  verifyEsewa: (data: string) =>
    api.post<ApiResponse<IPayment>>('/payments/esewa/verify', { data }),
};
