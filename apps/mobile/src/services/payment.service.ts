import api from './api';
import { API_ENDPOINTS } from '@amira/shared';

export const paymentService = {
  createEsewa: async (orderId: string) => {
    const { data } = await api.post(API_ENDPOINTS.PAYMENTS.CREATE_ESEWA, { orderId });
    return data.data;
  },

  verifyEsewa: async (payload: Record<string, string>) => {
    const { data } = await api.post(API_ENDPOINTS.PAYMENTS.VERIFY_ESEWA, payload);
    return data.data;
  },

  list: async (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    const { data } = await api.get(API_ENDPOINTS.PAYMENTS.LIST, { params });
    return data.data;
  },

  getById: async (id: string) => {
    const url = API_ENDPOINTS.PAYMENTS.BY_ID.replace(':id', id);
    const { data } = await api.get(url);
    return data.data;
  },
};
