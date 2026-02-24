import { api } from './api';
import type { ICategory, ApiResponse } from '@amira/shared';

export const categoryService = {
  listActive: () =>
    api.get<ApiResponse<ICategory[]>>('/categories/active'),

  getBySlug: (slug: string) =>
    api.get<ApiResponse<ICategory>>(`/categories/${slug}`),
};
