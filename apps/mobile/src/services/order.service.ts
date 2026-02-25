import api from './api';
import { API_ENDPOINTS } from '@amira/shared';

interface DeliveryAddress {
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  district: string;
  province: string;
  postalCode?: string;
}

interface CreateOrderPayload {
  products: Array<{ productId: string; quantity: number }>;
  deliveryAddress: DeliveryAddress;
  paymentMethod: 'COD' | 'ESEWA';
}

export const orderService = {
  list: async (params?: { page?: number; limit?: number; status?: string }) => {
    const { data } = await api.get(API_ENDPOINTS.ORDERS.LIST, { params });
    return data.data;
  },

  getById: async (id: string) => {
    const url = API_ENDPOINTS.ORDERS.BY_ID.replace(':id', id);
    const { data } = await api.get(url);
    return data.data;
  },

  create: async (payload: CreateOrderPayload) => {
    const { data } = await api.post(API_ENDPOINTS.ORDERS.CREATE, payload);
    return data.data;
  },

  updateStatus: async (id: string, orderStatus: string) => {
    const url = API_ENDPOINTS.ORDERS.UPDATE_STATUS.replace(':id', id);
    const { data } = await api.patch(url, { orderStatus });
    return data.data;
  },
};
