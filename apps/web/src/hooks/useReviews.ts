import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '@/services/review.service';
import toast from 'react-hot-toast';
import type { CreateReviewInput } from '@amira/shared';

export function useProductReviews(productId: string, page = 1) {
  return useQuery({
    queryKey: ['reviews', productId, page],
    queryFn: async () => {
      const { data } = await reviewService.getByProduct(productId, { page });
      return data;
    },
    enabled: !!productId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewInput) => reviewService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      toast.success('Review submitted for approval');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    },
  });
}
