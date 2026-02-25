import api from './api';
import { API_ENDPOINTS } from '@amira/shared';

interface ProductQuery {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const productService = {
  list: async (query: ProductQuery = {}) => {
    const { data } = await api.get(API_ENDPOINTS.PRODUCTS.LIST, { params: query });
    return data.data;
  },

  getBySlug: async (slug: string) => {
    const url = API_ENDPOINTS.PRODUCTS.BY_SLUG.replace(':slug', slug);
    const { data } = await api.get(url);
    return data.data;
  },

  getById: async (id: string) => {
    const url = API_ENDPOINTS.PRODUCTS.BY_ID.replace(':id', id);
    const { data } = await api.get(url);
    return data.data;
  },

  create: async (formData: FormData) => {
    const { data } = await api.post(API_ENDPOINTS.PRODUCTS.CREATE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  update: async (id: string, formData: FormData) => {
    const url = API_ENDPOINTS.PRODUCTS.UPDATE.replace(':id', id);
    const { data } = await api.put(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  delete: async (id: string) => {
    const url = API_ENDPOINTS.PRODUCTS.DELETE.replace(':id', id);
    const { data } = await api.delete(url);
    return data.data;
  },
};
