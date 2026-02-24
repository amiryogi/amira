import api from './api';
import { API_ENDPOINTS } from '@amira/shared';

export const analyticsService = {
  getDashboard: async () => {
    const { data } = await api.get(API_ENDPOINTS.ANALYTICS.DASHBOARD);
    return data.data;
  },

  getRevenue: async (params?: { period?: string }) => {
    const { data } = await api.get(API_ENDPOINTS.ANALYTICS.REVENUE, { params });
    return data.data;
  },

  getTopProducts: async (params?: { limit?: number }) => {
    const { data } = await api.get(API_ENDPOINTS.ANALYTICS.TOP_PRODUCTS, { params });
    return data.data;
  },
};
