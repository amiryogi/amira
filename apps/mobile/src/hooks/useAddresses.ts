import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addressService } from '@/services/address.service';

export function useAddresses() {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressService.list(),
  });
}

export function useCreateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addressService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['addresses'] }),
  });
}

export function useUpdateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      addressService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['addresses'] }),
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['addresses'] }),
  });
}

export function useSetDefaultAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressService.setDefault(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['addresses'] }),
  });
}
