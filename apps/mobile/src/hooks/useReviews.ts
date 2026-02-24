import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '@/services/review.service';

export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => reviewService.getByProduct(productId),
    enabled: !!productId,
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reviewService.create,
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['reviews', variables.product] });
      qc.invalidateQueries({ queryKey: ['product'] });
    },
  });
}
