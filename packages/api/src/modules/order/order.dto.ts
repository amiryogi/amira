import type { CreateOrderInput, OrderStatus, PaymentStatus } from '@amira/shared';

export type CreateOrderDTO = CreateOrderInput;

export interface UpdateOrderStatusDTO {
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
}
