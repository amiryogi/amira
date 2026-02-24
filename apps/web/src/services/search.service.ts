import { api } from './api';

export const searchService = {
  search: (params: { q: string; page?: number; limit?: number; categoryId?: string; minPrice?: number; maxPrice?: number }) =>
    api.get('/search', { params }),

  suggest: (q: string) =>
    api.get<{ success: boolean; data: Array<{ _id: string; name: string; slug: string }> }>('/search/suggest', { params: { q } }),
};
