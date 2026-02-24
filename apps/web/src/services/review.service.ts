import { api } from './api';
import type { CreateReviewInput, IReview, ApiResponse, PaginatedResponse } from '@amira/shared';

export const reviewService = {
  getByProduct: (productId: string, params: { page?: number; limit?: number } = {}) =>
    api.get<PaginatedResponse<IReview>>(`/reviews/product/${productId}`, { params }),

  create: (data: CreateReviewInput) =>
    api.post<ApiResponse<IReview>>('/reviews', data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/reviews/${id}`),
};
