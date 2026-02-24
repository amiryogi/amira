import { Category, ICategoryDocument } from './category.model.js';

export class CategoryRepository {
  async create(data: Partial<ICategoryDocument>): Promise<ICategoryDocument> {
    return Category.create(data);
  }

  async findById(id: string): Promise<ICategoryDocument | null> {
    return Category.findById(id);
  }

  async findBySlug(slug: string): Promise<ICategoryDocument | null> {
    return Category.findOne({ slug });
  }

  async findAll(filter: Record<string, unknown> = {}): Promise<ICategoryDocument[]> {
    return Category.find(filter).sort({ name: 1 });
  }

  async findPaginated(
    filter: Record<string, unknown>,
    sort: Record<string, 1 | -1>,
    skip: number,
    limit: number,
  ): Promise<ICategoryDocument[]> {
    return Category.find(filter).sort(sort).skip(skip).limit(limit);
  }

  async count(filter: Record<string, unknown> = {}): Promise<number> {
    return Category.countDocuments(filter);
  }

  async update(id: string, data: Partial<ICategoryDocument>): Promise<ICategoryDocument | null> {
    return Category.findByIdAndUpdate(id, data, { new: true });
  }

  async softDelete(id: string): Promise<void> {
    await Category.findByIdAndUpdate(id, { isDeleted: true });
  }
}
