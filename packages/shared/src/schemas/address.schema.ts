import { z } from 'zod';

export const addressSchema = z.object({
  label: z.string().min(1, 'Label is required').max(50),
  fullName: z.string().min(2, 'Full name is required').max(100),
  phone: z.string().min(10, 'Phone must be at least 10 characters').max(15),
  street: z.string().min(2, 'Street is required').max(200),
  city: z.string().min(2, 'City is required').max(100),
  district: z.string().min(2, 'District is required').max(100),
  province: z.string().min(1, 'Province is required').max(100),
  postalCode: z.string().max(10).optional(),
  isDefault: z.boolean().optional(),
});

export const createAddressSchema = addressSchema;

export const updateAddressSchema = addressSchema.partial();

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
