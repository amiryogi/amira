import api from './api';
import { API_ENDPOINTS } from '@amira/shared';

export const userService = {
  getProfile: async () => {
    const { data } = await api.get(API_ENDPOINTS.USERS.PROFILE);
    return data.data;
  },

  updateProfile: async (payload: { name?: string; phone?: string }) => {
    const { data } = await api.patch(API_ENDPOINTS.USERS.PROFILE, payload);
    return data.data;
  },

  list: async (params?: { page?: number; limit?: number; role?: string }) => {
    const { data } = await api.get(API_ENDPOINTS.USERS.LIST, { params });
    return data.data;
  },

  updateRole: async (id: string, role: string) => {
    const url = API_ENDPOINTS.USERS.UPDATE_ROLE.replace(':id', id);
    const { data } = await api.patch(url, { role });
    return data.data;
  },
};
