import { z } from 'zod';
import { PAGINATION_DEFAULTS } from '../constants';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION_DEFAULTS.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(PAGINATION_DEFAULTS.MAX_LIMIT)
    .default(PAGINATION_DEFAULTS.DEFAULT_LIMIT),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
});
