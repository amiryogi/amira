import api from './api';
import { API_ENDPOINTS } from '@amira/shared';

interface AddressPayload {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode?: string;
  isDefault?: boolean;
}

export const addressService = {
  list: async () => {
    const { data } = await api.get(API_ENDPOINTS.ADDRESSES.LIST);
    return data.data;
  },

  create: async (payload: AddressPayload) => {
    const { data } = await api.post(API_ENDPOINTS.ADDRESSES.CREATE, payload);
    return data.data;
  },

  update: async (id: string, payload: Partial<AddressPayload>) => {
    const url = API_ENDPOINTS.ADDRESSES.UPDATE.replace(':id', id);
    const { data } = await api.patch(url, payload);
    return data.data;
  },

  delete: async (id: string) => {
    const url = API_ENDPOINTS.ADDRESSES.DELETE.replace(':id', id);
    const { data } = await api.delete(url);
    return data.data;
  },

  setDefault: async (id: string) => {
    const url = API_ENDPOINTS.ADDRESSES.SET_DEFAULT.replace(':id', id);
    const { data } = await api.patch(url);
    return data.data;
  },
};
