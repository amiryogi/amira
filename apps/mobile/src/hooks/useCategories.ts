import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/services/category.service';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.list(),
    staleTime: 10 * 60 * 1000, // categories rarely change
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: () => categoryService.getBySlug(slug),
    enabled: !!slug,
  });
}
