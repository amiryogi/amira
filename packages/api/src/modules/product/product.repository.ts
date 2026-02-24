import { Product, IProductDocument } from './product.model.js';

export class ProductRepository {
  async create(data: Partial<IProductDocument>): Promise<IProductDocument> {
    return Product.create(data);
  }

  async findById(id: string): Promise<IProductDocument | null> {
    return Product.findById(id).populate('categoryId', 'name slug');
  }

  async findBySlug(slug: string): Promise<IProductDocument | null> {
    return Product.findOne({ slug }).populate('categoryId', 'name slug');
  }

  async findPaginated(
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

  async count(filter: Record<string, unknown> = {}): Promise<number> {
    return Product.countDocuments(filter);
  }

  async update(id: string, data: Partial<IProductDocument>): Promise<IProductDocument | null> {
    return Product.findByIdAndUpdate(id, data, { new: true }).populate('categoryId', 'name slug');
  }

  async softDelete(id: string): Promise<void> {
    await Product.findByIdAndUpdate(id, { isDeleted: true });
  }

  async textSearch(query: string, limit: number): Promise<IProductDocument[]> {
    return Product.find(
      { $text: { $search: query }, isActive: true },
      { score: { $meta: 'textScore' } },
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .populate('categoryId', 'name slug');
  }

  async updateRating(productId: string, averageRating: number, totalReviews: number): Promise<void> {
    await Product.findByIdAndUpdate(productId, { averageRating, totalReviews });
  }

  async decrementStock(productId: string, quantity: number): Promise<IProductDocument | null> {
    return Product.findOneAndUpdate(
      { _id: productId, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { new: true },
    );
  }

  async incrementStock(productId: string, quantity: number): Promise<void> {
    await Product.findByIdAndUpdate(productId, { $inc: { stock: quantity } });
  }
}
