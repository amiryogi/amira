import { z } from 'zod';

export const userProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().min(10).max(15).optional(),
});

export const updateUserSchema = userProfileSchema;

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
