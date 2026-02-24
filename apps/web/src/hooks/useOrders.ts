import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';
import toast from 'react-hot-toast';
import type { CreateOrderInput } from '@amira/shared';

export function useUserOrders(page = 1) {
  return useQuery({
    queryKey: ['orders', page],
    queryFn: async () => {
      const { data } = await orderService.getUserOrders({ page });
      return data;
    },
  });
}

export function useOrderById(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data } = await orderService.getById(id);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderInput) => orderService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to create order');
    },
  });
}
