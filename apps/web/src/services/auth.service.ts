import { api } from './api';
import type {
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  IUser,
  ApiResponse,
} from '@amira/shared';

export const authService = {
  login: (data: LoginInput) =>
    api.post<ApiResponse<{ accessToken: string; user: IUser }>>('/auth/login', data),

  register: (data: RegisterInput) =>
    api.post<ApiResponse<{ accessToken: string; user: IUser }>>('/auth/register', data),

  logout: () => api.post('/auth/logout'),

  refresh: () =>
    api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh'),

  forgotPassword: (data: ForgotPasswordInput) =>
    api.post<ApiResponse<null>>('/auth/forgot-password', data),

  resetPassword: (data: ResetPasswordInput) =>
    api.post<ApiResponse<null>>('/auth/reset-password', data),
};
