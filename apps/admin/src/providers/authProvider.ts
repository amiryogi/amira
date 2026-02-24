import type { AuthProvider } from '@refinedev/core';
import api, { setAccessToken, getAccessToken } from './api';

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAccessToken(data.data.accessToken);
      return { success: true, redirectTo: '/' };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return {
        success: false,
        error: {
          name: 'Login Error',
          message: err?.response?.data?.message || 'Invalid credentials',
        },
      };
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    setAccessToken('');
    return { success: true, redirectTo: '/login' };
  },

  check: async () => {
    if (getAccessToken()) {
      return { authenticated: true };
    }
    // Try refreshing using raw axios to avoid interceptor loop
    try {
      const { data } = await (await import('axios')).default.post(
        '/api/v1/auth/refresh',
        {},
        { withCredentials: true },
      );
      setAccessToken(data.data.accessToken);
      return { authenticated: true };
    } catch {
      return { authenticated: false, redirectTo: '/login' };
    }
  },

  getIdentity: async () => {
    try {
      const { data } = await api.get('/users/profile');
      const user = data.data;
      if (user.role !== 'ADMIN') {
        return null;
      }
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: undefined,
      };
    } catch {
      return null;
    }
  },

  getPermissions: async () => {
    try {
      const { data } = await api.get('/users/profile');
      return data.data.role;
    } catch {
      return null;
    }
  },

  onError: async (error) => {
    if (error.statusCode === 401) {
      return { logout: true };
    }
    return { error };
  },
};
