import { z } from 'zod';

export { createOrderSchema } from '@amira/shared/schemas';

export const updateOrderStatusSchema = z.object({
  orderStatus: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
}).refine(
  (data) => data.orderStatus || data.paymentStatus,
  { message: 'At least one status field must be provided' },
);
