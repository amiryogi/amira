import { api } from './api';
import type { IUser, ApiResponse } from '@amira/shared';

export const userService = {
  getProfile: () =>
    api.get<ApiResponse<IUser>>('/users/profile'),

  updateProfile: (data: { name?: string; phone?: string }) =>
    api.put<ApiResponse<IUser>>('/users/profile', data),
};
