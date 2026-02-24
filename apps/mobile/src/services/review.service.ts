import api from './api';
import { API_ENDPOINTS } from '@amira/shared';

export const reviewService = {
  getByProduct: async (productId: string) => {
    const url = API_ENDPOINTS.REVIEWS.BY_PRODUCT.replace(':productId', productId);
    const { data } = await api.get(url);
    return data.data;
  },

  create: async (payload: { product: string; rating: number; comment?: string }) => {
    const { data } = await api.post(API_ENDPOINTS.REVIEWS.CREATE, payload);
    return data.data;
  },

  delete: async (id: string) => {
    const url = API_ENDPOINTS.REVIEWS.DELETE.replace(':id', id);
    const { data } = await api.delete(url);
    return data.data;
  },
};
