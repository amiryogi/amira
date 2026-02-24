import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/services/category.service';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await categoryService.listActive();
      return data.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}
