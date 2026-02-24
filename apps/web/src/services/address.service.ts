import { api } from './api';
import type { IAddress, CreateAddressInput, UpdateAddressInput, ApiResponse } from '@amira/shared';

export const addressService = {
  list: () =>
    api.get<ApiResponse<IAddress[]>>('/users/addresses'),

  create: (data: CreateAddressInput) =>
    api.post<ApiResponse<IAddress>>('/users/addresses', data),

  update: (id: string, data: UpdateAddressInput) =>
    api.put<ApiResponse<IAddress>>(`/users/addresses/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/users/addresses/${id}`),

  setDefault: (id: string) =>
    api.put<ApiResponse<IAddress>>(`/users/addresses/${id}/default`),
};
