import { CategoryRepository } from './category.repository.js';
import { ApiError } from '../../common/ApiError.js';
import { generateSlug } from '../../utils/slug.js';
import { buildPagination, buildPaginationMeta } from '../../utils/pagination.js';
import type { CreateCategoryInput, UpdateCategoryInput, ICategory, PaginationParams } from '@amira/shared';
import type { ICategoryDocument } from './category.model.js';

export class CategoryService {
  private categoryRepo: CategoryRepository;

  constructor() {
    this.categoryRepo = new CategoryRepository();
  }

  async listCategories(query: PaginationParams & { search?: string }) {
    const { skip, limit, sort, page } = buildPagination(query);

    const filter: Record<string, unknown> = {};
    if (query.search) {
      filter.name = { $regex: query.search, $options: 'i' };
    }

    const [categories, total] = await Promise.all([
      this.categoryRepo.findPaginated(filter, sort, skip, limit),
      this.categoryRepo.count(filter),
    ]);

    return {
      data: categories.map(this.toCategory),
      pagination: buildPaginationMeta(total, page, limit),
    };
  }

  async getAllActive(): Promise<ICategory[]> {
    const categories = await this.categoryRepo.findAll({ isActive: true });
    return categories.map(this.toCategory);
  }

  async getBySlug(slug: string): Promise<ICategory> {
    const category = await this.categoryRepo.findBySlug(slug);
    if (!category) {
      throw ApiError.notFound('Category not found');
    }
    return this.toCategory(category);
  }

  async createCategory(input: CreateCategoryInput): Promise<ICategory> {
    const slug = input.slug || generateSlug(input.name);

    const existing = await this.categoryRepo.findBySlug(slug);
    if (existing) {
      throw ApiError.conflict('Category with this slug already exists');
    }

    const category = await this.categoryRepo.create({ ...input, slug });
    return this.toCategory(category);
  }

  async updateCategory(id: string, input: UpdateCategoryInput): Promise<ICategory> {
    const category = await this.categoryRepo.findById(id);
    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    if (input.name && !input.slug) {
      input.slug = generateSlug(input.name);
    }

    if (input.slug && input.slug !== category.slug) {
      const existing = await this.categoryRepo.findBySlug(input.slug);
      if (existing) {
        throw ApiError.conflict('Category with this slug already exists');
      }
    }

    const updated = await this.categoryRepo.update(id, input);
    if (!updated) throw ApiError.notFound('Category not found');
    return this.toCategory(updated);
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await this.categoryRepo.findById(id);
    if (!category) {
      throw ApiError.notFound('Category not found');
    }
    await this.categoryRepo.softDelete(id);
  }

  private toCategory(doc: ICategoryDocument): ICategory {
    return {
      _id: String(doc._id),
      name: doc.name,
      slug: doc.slug,
      description: doc.description,
      isActive: doc.isActive,
      isDeleted: doc.isDeleted,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
