import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters').max(100),
  slug: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();
