import { z } from 'zod';

export const esewaCreateSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
});

export const esewaVerifySchema = z.object({
  data: z.string().min(1, 'eSewa response data is required'),
});
