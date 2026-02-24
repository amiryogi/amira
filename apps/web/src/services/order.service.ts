import { api } from './api';
import type { CreateOrderInput, IOrder, ApiResponse, PaginatedResponse } from '@amira/shared';

export const orderService = {
  create: (data: CreateOrderInput) =>
    api.post<ApiResponse<IOrder>>('/orders', data),

  getUserOrders: (params: { page?: number; limit?: number } = {}) =>
    api.get<PaginatedResponse<IOrder>>('/orders', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<IOrder>>(`/orders/${id}`),
};
