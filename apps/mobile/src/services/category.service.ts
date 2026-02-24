import api from './api';
import { API_ENDPOINTS } from '@amira/shared';

export const categoryService = {
  list: async () => {
    const { data } = await api.get(API_ENDPOINTS.CATEGORIES.LIST);
    return data.data;
  },

  getBySlug: async (slug: string) => {
    const url = API_ENDPOINTS.CATEGORIES.BY_SLUG.replace(':slug', slug);
    const { data } = await api.get(url);
    return data.data;
  },
};
