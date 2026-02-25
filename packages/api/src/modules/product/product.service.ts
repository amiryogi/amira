import { ProductRepository } from './product.repository.js';
import { ApiError } from '../../common/ApiError.js';
import { generateSlug } from '../../utils/slug.js';
import { buildPagination, buildPaginationMeta } from '../../utils/pagination.js';
import { cloudinary } from '../../config/cloudinary.js';
import type { CreateProductInput, UpdateProductInput, IProduct, PaginationParams } from '@amira/shared';
import type { IProductDocument } from './product.model.js';

export class ProductService {
  private productRepo: ProductRepository;

  constructor() {
    this.productRepo = new ProductRepository();
  }

  async listProducts(query: PaginationParams & {
    search?: string;
    categoryId?: string;
    minPrice?: string;
    maxPrice?: string;
    isFeatured?: string;
  }) {
    const { skip, limit, sort, page } = buildPagination(query);

    const filter: Record<string, unknown> = { isActive: true };
    if (query.search) {
      filter.name = { $regex: query.search, $options: 'i' };
    }
    if (query.categoryId) {
      filter.categoryId = query.categoryId;
    }
    if (query.minPrice || query.maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (query.minPrice) priceFilter.$gte = Number(query.minPrice);
      if (query.maxPrice) priceFilter.$lte = Number(query.maxPrice);
      filter.price = priceFilter;
    }
    if (query.isFeatured === 'true') {
      filter.isFeatured = true;
    }

    const [products, total] = await Promise.all([
      this.productRepo.findPaginated(filter, sort, skip, limit),
      this.productRepo.count(filter),
    ]);

    return {
      data: products.map(this.toProduct),
      pagination: buildPaginationMeta(total, page, limit),
    };
  }

  async adminListProducts(query: PaginationParams & { search?: string }) {
    const { skip, limit, sort, page } = buildPagination(query);

    const filter: Record<string, unknown> = {};
    if (query.search) {
      filter.name = { $regex: query.search, $options: 'i' };
    }

    const [products, total] = await Promise.all([
      this.productRepo.findPaginated(filter, sort, skip, limit),
      this.productRepo.count(filter),
    ]);

    return {
      data: products.map(this.toProduct),
      pagination: buildPaginationMeta(total, page, limit),
    };
  }

  async getBySlug(slug: string): Promise<IProduct> {
    const product = await this.productRepo.findBySlug(slug);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }
    return this.toProduct(product);
  }

  async getById(id: string): Promise<IProduct> {
    const product = await this.productRepo.findById(id);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }
    return this.toProduct(product);
  }

  async createProduct(input: CreateProductInput, files?: Express.Multer.File[]): Promise<IProduct> {
    const slug = generateSlug(input.name);

    const existing = await this.productRepo.findBySlug(slug);
    if (existing) {
      throw ApiError.conflict('Product with this slug already exists');
    }

    const images = await this.uploadImages(files);

    const product = await this.productRepo.create({
      ...input,
      slug,
      images,
    } as Partial<IProductDocument>);

    return this.toProduct(product);
  }

  async updateProduct(id: string, input: UpdateProductInput, files?: Express.Multer.File[]): Promise<IProduct> {
    const product = await this.productRepo.findById(id);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    const updateData: Partial<IProductDocument> = { ...input } as Partial<IProductDocument>;

    if (input.name) {
      const newSlug = generateSlug(input.name);
      if (newSlug !== product.slug) {
        const existing = await this.productRepo.findBySlug(newSlug);
        if (existing) {
          throw ApiError.conflict('Product with this slug already exists');
        }
        updateData.slug = newSlug;
      }
    }

    if (files && files.length > 0) {
      // Delete old images from Cloudinary
      await this.deleteImages(product.images);
      updateData.images = await this.uploadImages(files);
    }

    const updated = await this.productRepo.update(id, updateData);
    if (!updated) throw ApiError.notFound('Product not found');
    return this.toProduct(updated);
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await this.productRepo.findById(id);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }
    await this.productRepo.softDelete(id);
  }

  private async uploadImages(files?: Express.Multer.File[]): Promise<string[]> {
    if (!files || files.length === 0) return [];

    // Skip upload if Cloudinary is not configured (dev mode without credentials)
    const { config } = await import('../../config/index.js');
    if (!config.cloudinary.cloudName || !config.cloudinary.apiKey) {
      console.warn('⚠️  Cloudinary not configured — skipping image upload');
      return files.map((f) => `/placeholder-${f.originalname}`);
    }

    const uploadPromises = files.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'amira/products',
              transformation: [
                { width: 800, height: 800, crop: 'limit', quality: 'auto:good', format: 'webp' },
              ],
            },
            (error, result) => {
              if (error || !result) return reject(error || new Error('Upload failed'));
              resolve(result.secure_url);
            },
          );
          stream.end(file.buffer);
        }),
    );

    return Promise.all(uploadPromises);
  }

  private async deleteImages(urls: string[]): Promise<void> {
    const deletePromises = urls.map((url) => {
      const parts = url.split('/');
      const fileName = parts[parts.length - 1];
      const publicId = `amira/products/${fileName.split('.')[0]}`;
      return cloudinary.uploader.destroy(publicId);
    });
    await Promise.all(deletePromises);
  }

  private toProduct(doc: IProductDocument): IProduct & { category?: { name: string; slug: string } } {
    const populatedCategory = typeof doc.categoryId === 'object' && doc.categoryId !== null && 'name' in (doc.categoryId as Record<string, unknown>)
      ? doc.categoryId as unknown as { _id: { toString(): string }; name: string; slug: string }
      : null;

    return {
      _id: doc._id as string,
      name: doc.name,
      slug: doc.slug,
      description: doc.description,
      price: doc.price,
      discountPrice: doc.discountPrice,
      stock: doc.stock,
      images: doc.images,
      categoryId: populatedCategory ? populatedCategory._id.toString() : doc.categoryId.toString(),
      ...(populatedCategory && { category: { name: populatedCategory.name, slug: populatedCategory.slug } }),
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
