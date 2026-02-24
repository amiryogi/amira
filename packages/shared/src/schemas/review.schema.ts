import { z } from 'zod';

export const createReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().min(3, 'Comment must be at least 3 characters').max(1000),
});
