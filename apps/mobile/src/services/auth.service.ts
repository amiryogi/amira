import api, { setAccessToken } from './api';
import * as SecureStore from 'expo-secure-store';
import { API_ENDPOINTS } from '@amira/shared';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export const authService = {
  login: async (payload: LoginPayload) => {
    const { data } = await api.post(API_ENDPOINTS.AUTH.LOGIN, payload);
    const { accessToken, refreshToken, user } = data.data;
    setAccessToken(accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);
    return user;
  },

  register: async (payload: RegisterPayload) => {
    const { data } = await api.post(API_ENDPOINTS.AUTH.REGISTER, payload);
    const { accessToken, refreshToken, user } = data.data;
    setAccessToken(accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);
    return user;
  },

  logout: async () => {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      setAccessToken('');
      await SecureStore.deleteItemAsync('refreshToken');
    }
  },

  forgotPassword: async (email: string) => {
    const { data } = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    return data;
  },

  resetPassword: async (token: string, password: string) => {
    const { data } = await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      token,
      password,
    });
    return data;
  },

  refreshSession: async () => {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    if (!refreshToken) throw new Error('No refresh token stored');

    const { data } = await api.post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });
    const { accessToken: newAccess, refreshToken: newRefresh, user } = data.data;
    setAccessToken(newAccess);
    if (newRefresh) {
      await SecureStore.setItemAsync('refreshToken', newRefresh);
    }
    return user;
  },
};
