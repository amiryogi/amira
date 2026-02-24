export interface EsewaPaymentRequestDTO {
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

export interface EsewaVerifyDTO {
  data: string; // Base64-encoded response from eSewa
}

export interface PaymentListQueryDTO {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  status?: string;
  paymentMethod?: string;
  transactionId?: string;
}
