import api from './api';
import { API_ENDPOINTS } from '@amira/shared';

export const searchService = {
  search: async (query: string, params?: { page?: number; limit?: number }) => {
    const { data } = await api.get(API_ENDPOINTS.SEARCH.SEARCH, {
      params: { q: query, ...params },
    });
    return data.data;
  },

  suggest: async (query: string) => {
    const { data } = await api.get(API_ENDPOINTS.SEARCH.SUGGEST, {
      params: { q: query },
    });
    return data.data;
  },
};
