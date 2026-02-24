import { z } from 'zod';

export const createOrderSchema = z.object({
  products: z
    .array(
      z.object({
        productId: z.string().min(1, 'Product ID is required'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1'),
      }),
    )
    .min(1, 'At least one product is required'),
  deliveryAddress: z.object({
    label: z.string().min(1).max(50),
    fullName: z.string().min(2).max(100),
    phone: z.string().min(10).max(15),
    street: z.string().min(2).max(200),
    city: z.string().min(2).max(100),
    district: z.string().min(2).max(100),
    province: z.string().min(1).max(100),
    postalCode: z.string().max(10).optional(),
  }),
  paymentMethod: z.enum(['COD', 'ESEWA']),
});
