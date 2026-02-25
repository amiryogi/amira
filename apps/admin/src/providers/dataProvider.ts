import type { DataProvider } from '@refinedev/core';
import api from './api';
import type { AxiosRequestConfig } from 'axios';

export const dataProvider: DataProvider = {
  getList: async ({ resource, pagination, sorters, filters }) => {
    const params: Record<string, unknown> = {};

    // Pagination
    if (pagination) {
      const { current = 1, pageSize = 10 } = pagination;
      params.page = current;
      params.limit = pageSize;
    }

    // Sorting
    if (sorters && sorters.length > 0) {
      const sorter = sorters[0];
      params.sort = `${sorter.order === 'desc' ? '-' : ''}${sorter.field}`;
    }

    // Filters
    if (filters) {
      for (const filter of filters) {
        if ('field' in filter && filter.value !== undefined && filter.value !== '') {
          params[filter.field] = filter.value;
        }
      }
    }

    // Admin-specific list endpoints
    const adminListEndpoints: Record<string, string> = {
      orders: '/orders/admin/all',
      products: '/products/admin/all',
      notifications: '/notifications/admin/all',
    };
    const endpoint = adminListEndpoints[resource] || `/${resource}`;
    const { data } = await api.get(endpoint, { params });

    return {
      data: data.data || [],
      total: data.pagination?.total || data.data?.length || 0,
    };
  },

  getOne: async ({ resource, id }) => {
    const { data } = await api.get(`/${resource}/${id}`);
    return { data: data.data };
  },

  create: async ({ resource, variables }) => {
    const config: AxiosRequestConfig = {};
    if (variables instanceof FormData) {
      config.headers = { 'Content-Type': 'multipart/form-data' };
    }
    const { data } = await api.post(`/${resource}`, variables, config);
    return { data: data.data };
  },

  update: async ({ resource, id, variables }) => {
    const config: AxiosRequestConfig = {};
    if (variables instanceof FormData) {
      config.headers = { 'Content-Type': 'multipart/form-data' };
    }
    // Resource-specific update endpoints
    const updateEndpoints: Record<string, string> = {
      orders: `/${resource}/${id}/status`,
      reviews: `/${resource}/${id}/approve`,
      users: `/${resource}/${id}/role`,
    };
    const endpoint = updateEndpoints[resource] || `/${resource}/${id}`;
    const { data } = await api.put(endpoint, variables, config);
    return { data: data.data };
  },

  deleteOne: async ({ resource, id }) => {
    const { data } = await api.delete(`/${resource}/${id}`);
    return { data: data.data };
  },

  getApiUrl: () => '/api/v1',

  custom: async ({ url, method, payload, query }) => {
    // Strip the baseURL prefix if the caller already included it,
    // since the axios instance already sets baseURL to '/api/v1'
    const cleanUrl = url.replace(/^\/api\/v1/, '');
    const config: AxiosRequestConfig = {
      url: cleanUrl,
      method: method as string,
      data: payload,
      params: query,
    };
    const { data } = await api(config);
    return { data: data.data || data };
  },
};
