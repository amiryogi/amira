import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductService } from '../product.service.js';
import { createTestCategory } from '../../../test/factories/category.factory.js';
import { createTestProduct } from '../../../test/factories/product.factory.js';
import mongoose from 'mongoose';

// Mock cloudinary to prevent external calls
vi.mock('../../../config/cloudinary.js', () => ({
  cloudinary: {
    uploader: {
      upload_stream: vi.fn(),
      destroy: vi.fn().mockResolvedValue({ result: 'ok' }),
    },
  },
}));

describe('ProductService', () => {
  let productService: ProductService;

  beforeEach(() => {
    productService = new ProductService();
  });

  describe('createProduct', () => {
    it('should create a product with valid data', async () => {
      const category = await createTestCategory();

      const result = await productService.createProduct({
        name: 'Premium Pashmina Shawl',
        description: 'Handcrafted pure pashmina from Himalayan goats',
        price: 5500,
        stock: 30,
        categoryId: (category._id as mongoose.Types.ObjectId).toString(),
        isFeatured: true,
      });

      expect(result.name).toBe('Premium Pashmina Shawl');
      expect(result.slug).toContain('premium-pashmina-shawl');
      expect(result.price).toBe(5500);
      expect(result.stock).toBe(30);
      expect(result.isFeatured).toBe(true);
    });

    it('should throw error for duplicate slug', async () => {
      const category = await createTestCategory();
      const catId = (category._id as mongoose.Types.ObjectId).toString();

      await productService.createProduct({
        name: 'Unique Product',
        description: 'A unique product',
        price: 1000,
        stock: 10,
        categoryId: catId,
      });

      await expect(
        productService.createProduct({
          name: 'Unique Product',
          description: 'Another with same name',
          price: 2000,
          stock: 20,
          categoryId: catId,
        }),
      ).rejects.toThrow('Product with this slug already exists');
    });
  });

  describe('getBySlug', () => {
    it('should return product by slug', async () => {
      const product = await createTestProduct({ name: 'Slug Test Product' });

      const result = await productService.getBySlug(product.slug);
      expect(result.name).toBe('Slug Test Product');
    });

    it('should throw 404 for non-existent slug', async () => {
      await expect(productService.getBySlug('no-such-product')).rejects.toThrow(
        'Product not found',
      );
    });
  });

  describe('getById', () => {
    it('should return product by ID', async () => {
      const product = await createTestProduct();
      const result = await productService.getById(
        (product._id as mongoose.Types.ObjectId).toString(),
      );
      expect(result.name).toBe(product.name);
    });

    it('should throw 404 for non-existent ID', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await expect(productService.getById(fakeId)).rejects.toThrow('Product not found');
    });
  });

  describe('listProducts', () => {
    it('should return paginated active products', async () => {
      const category = await createTestCategory();
      const catId = category._id as mongoose.Types.ObjectId;

      await createTestProduct({ categoryId: catId, isActive: true });
      await createTestProduct({ categoryId: catId, isActive: true });
      await createTestProduct({ categoryId: catId, isActive: false });

      const result = await productService.listProducts({ page: 1, limit: 10 });
      // Only active products show
      expect(result.data.length).toBe(2);
      expect(result.pagination).toBeDefined();
    });

    it('should filter by category', async () => {
      const cat1 = await createTestCategory({ name: 'Shawls' });
      const cat2 = await createTestCategory({ name: 'Caps' });

      await createTestProduct({ categoryId: cat1._id as mongoose.Types.ObjectId });
      await createTestProduct({ categoryId: cat2._id as mongoose.Types.ObjectId });

      const result = await productService.listProducts({
        categoryId: (cat1._id as mongoose.Types.ObjectId).toString(),
      });
      expect(result.data).toHaveLength(1);
    });

    it('should filter by price range', async () => {
      const category = await createTestCategory();
      const catId = category._id as mongoose.Types.ObjectId;

      await createTestProduct({ categoryId: catId, price: 500 });
      await createTestProduct({ categoryId: catId, price: 2000 });
      await createTestProduct({ categoryId: catId, price: 5000 });

      const result = await productService.listProducts({
        minPrice: '1000',
        maxPrice: '3000',
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].price).toBe(2000);
    });
  });

  describe('updateProduct', () => {
    it('should update product fields', async () => {
      const product = await createTestProduct();
      const id = (product._id as mongoose.Types.ObjectId).toString();

      const result = await productService.updateProduct(id, {
        price: 9999,
        stock: 100,
      });

      expect(result.price).toBe(9999);
      expect(result.stock).toBe(100);
    });

    it('should throw 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await expect(
        productService.updateProduct(fakeId, { price: 100 }),
      ).rejects.toThrow('Product not found');
    });
  });

  describe('deleteProduct', () => {
    it('should soft delete product', async () => {
      const product = await createTestProduct();
      const id = (product._id as mongoose.Types.ObjectId).toString();

      await expect(productService.deleteProduct(id)).resolves.not.toThrow();
    });

    it('should throw 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await expect(productService.deleteProduct(fakeId)).rejects.toThrow(
        'Product not found',
      );
    });
  });
});
