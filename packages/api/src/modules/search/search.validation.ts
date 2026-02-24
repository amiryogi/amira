import { z } from 'zod';

export const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required').max(200),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  categoryId: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const suggestQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required').max(200),
  limit: z.coerce.number().int().min(1).max(10).default(5),
});
