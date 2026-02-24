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

    const { data } = await api.get(`/${resource}`, { params });

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
    const { data } = await api.put(`/${resource}/${id}`, variables, config);
    return { data: data.data };
  },

  deleteOne: async ({ resource, id }) => {
    const { data } = await api.delete(`/${resource}/${id}`);
    return { data: data.data };
  },

  getApiUrl: () => '/api/v1',

  custom: async ({ url, method, payload, query }) => {
    const config: AxiosRequestConfig = {
      url,
      method: method as string,
      data: payload,
      params: query,
    };
    const { data } = await api(config);
    return { data: data.data || data };
  },
};
