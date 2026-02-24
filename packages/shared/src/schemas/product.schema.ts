import { z } from 'zod';

const productVariantSchema = z.object({
  size: z.string().optional(),
  color: z.string().optional(),
  stock: z.coerce.number().int().min(0).optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  price: z.coerce.number().positive('Price must be positive'),
  discountPrice: z.coerce.number().positive().optional(),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  categoryId: z.string().min(1, 'Category is required'),
  variants: z.array(productVariantSchema).optional(),
  isFeatured: z.coerce.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial();
