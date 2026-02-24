import { useQuery } from '@tanstack/react-query';
import { productService, type ProductQueryParams } from '@/services/product.service';

export function useProducts(params: ProductQueryParams = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const { data } = await productService.list(params);
      return data;
    },
  });
}

export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data } = await productService.getBySlug(slug);
      return data.data;
    },
    enabled: !!slug,
  });
}
