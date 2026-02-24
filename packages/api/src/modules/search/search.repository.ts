import { Product, IProductDocument } from '../product/product.model.js';

export class SearchRepository {
  async textSearch(query: string, limit: number): Promise<IProductDocument[]> {
    return Product.find(
      { $text: { $search: query }, isActive: true },
      { score: { $meta: 'textScore' } },
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .populate('categoryId', 'name slug');
  }

  async suggest(query: string, limit: number): Promise<Array<{ _id: string; name: string; slug: string }>> {
    return Product.find(
      { name: { $regex: query, $options: 'i' }, isActive: true },
      { name: 1, slug: 1 },
    )
      .limit(limit)
      .lean<Array<{ _id: string; name: string; slug: string }>>();
  }

  async filterSearch(
    filter: Record<string, unknown>,
    sort: Record<string, 1 | -1>,
    skip: number,
    limit: number,
  ): Promise<IProductDocument[]> {
    return Product.find(filter)
      .populate('categoryId', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  async countFilter(filter: Record<string, unknown>): Promise<number> {
    return Product.countDocuments(filter);
  }
}
