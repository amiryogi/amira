import { z } from 'zod';

export const revenueQuerySchema = z.object({
  months: z.coerce.number().int().min(1).max(24).default(12),
});

export const topProductsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
