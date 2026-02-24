import { api } from './api';
import type { IProduct, PaginatedResponse } from '@amira/shared';

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
}

export const productService = {
  list: (params: ProductQueryParams = {}) =>
    api.get<PaginatedResponse<IProduct>>('/products', { params }),

  getBySlug: (slug: string) =>
    api.get<{ success: boolean; message: string; data: IProduct }>(`/products/slug/${slug}`),

  getById: (id: string) =>
    api.get<{ success: boolean; message: string; data: IProduct }>(`/products/${id}`),
};
