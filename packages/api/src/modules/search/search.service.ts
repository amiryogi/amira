import { SearchRepository } from './search.repository.js';
import { buildPagination, buildPaginationMeta } from '../../utils/pagination.js';
import type { IProduct } from '@amira/shared';
import type { IProductDocument } from '../product/product.model.js';
import type { SearchQueryDTO, SuggestQueryDTO } from './search.dto.js';

export class SearchService {
  private searchRepo: SearchRepository;

  constructor() {
    this.searchRepo = new SearchRepository();
  }

  async search(query: SearchQueryDTO) {
    const { skip, limit, sort, page } = buildPagination(query);

    const filter: Record<string, unknown> = { isActive: true };

    // Use text search if available, otherwise regex
    if (query.q) {
      filter.$text = { $search: query.q };
    }
    if (query.categoryId) {
      filter.categoryId = query.categoryId;
    }
    if (query.minPrice || query.maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (query.minPrice) priceFilter.$gte = query.minPrice;
      if (query.maxPrice) priceFilter.$lte = query.maxPrice;
      filter.price = priceFilter;
    }

    const textSort = query.q
      ? { score: { $meta: 'textScore' as const }, ...sort }
      : sort;

    const [products, total] = await Promise.all([
      this.searchRepo.filterSearch(filter, textSort as Record<string, 1 | -1>, skip, limit),
      this.searchRepo.countFilter(filter),
    ]);

    return {
      data: products.map(this.toProduct),
      pagination: buildPaginationMeta(total, page, limit),
    };
  }

  async suggest(query: SuggestQueryDTO) {
    const suggestions = await this.searchRepo.suggest(query.q, query.limit || 5);
    return suggestions.map((s) => ({
      _id: s._id,
      name: s.name,
      slug: s.slug,
    }));
  }

  private toProduct(doc: IProductDocument): IProduct {
    return {
      _id: String(doc._id),
      name: doc.name,
      slug: doc.slug,
      description: doc.description,
      price: doc.price,
      discountPrice: doc.discountPrice,
      stock: doc.stock,
      images: doc.images,
      categoryId: doc.categoryId.toString(),
      variants: doc.variants,
      averageRating: doc.averageRating,
      totalReviews: doc.totalReviews,
      isFeatured: doc.isFeatured,
      isActive: doc.isActive,
      isDeleted: doc.isDeleted,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
