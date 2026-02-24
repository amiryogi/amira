import { describe, it, expect, beforeEach } from 'vitest';
import { CategoryService } from '../category.service.js';
import { createTestCategory } from '../../../test/factories/category.factory.js';

describe('CategoryService', () => {
  let categoryService: CategoryService;

  beforeEach(() => {
    categoryService = new CategoryService();
  });

  describe('createCategory', () => {
    it('should create a category with valid data', async () => {
      const result = await categoryService.createCategory({
        name: 'Pashmina Shawls',
        description: 'Finest pashmina from Nepal',
      });

      expect(result.name).toBe('Pashmina Shawls');
      expect(result.slug).toBeDefined();
      expect(result.isActive).toBe(true);
    });

    it('should throw error for duplicate slug', async () => {
      await categoryService.createCategory({
        name: 'Woolen Caps',
        slug: 'woolen-caps',
      });

      await expect(
        categoryService.createCategory({
          name: 'Woolen Caps 2',
          slug: 'woolen-caps',
        }),
      ).rejects.toThrow('Category with this slug already exists');
    });
  });

  describe('getBySlug', () => {
    it('should return category by slug', async () => {
      const created = await categoryService.createCategory({
        name: 'Felt Products',
        slug: 'felt-products',
      });

      const result = await categoryService.getBySlug('felt-products');
      expect(result.name).toBe('Felt Products');
      expect(result._id).toBe(created._id);
    });

    it('should throw 404 for non-existent slug', async () => {
      await expect(categoryService.getBySlug('non-existent')).rejects.toThrow(
        'Category not found',
      );
    });
  });

  describe('listCategories', () => {
    it('should return paginated categories', async () => {
      await createTestCategory({ name: 'Category A' });
      await createTestCategory({ name: 'Category B' });
      await createTestCategory({ name: 'Category C' });

      const result = await categoryService.listCategories({ page: 1, limit: 2 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.totalPages).toBe(2);
    });

    it('should filter categories by search', async () => {
      await createTestCategory({ name: 'Cashmere Wrap' });
      await createTestCategory({ name: 'Yak Wool' });

      const result = await categoryService.listCategories({ search: 'Cashmere' });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Cashmere Wrap');
    });
  });

  describe('getAllActive', () => {
    it('should return only active categories', async () => {
      await createTestCategory({ name: 'Active One', isActive: true });
      await createTestCategory({ name: 'Inactive One', isActive: false });

      const result = await categoryService.getAllActive();
      expect(result.every((c) => c.isActive)).toBe(true);
    });
  });

  describe('updateCategory', () => {
    it('should update category name and regenerate slug', async () => {
      const created = await categoryService.createCategory({ name: 'Old Name' });
      const updated = await categoryService.updateCategory(created._id, {
        name: 'New Name',
      });

      expect(updated.name).toBe('New Name');
      expect(updated.slug).toContain('new-name');
    });

    it('should throw 404 for non-existent category', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await expect(
        categoryService.updateCategory(fakeId, { name: 'Updated' }),
      ).rejects.toThrow('Category not found');
    });
  });

  describe('deleteCategory', () => {
    it('should soft delete category', async () => {
      const created = await categoryService.createCategory({ name: 'To Delete' });
      await expect(categoryService.deleteCategory(created._id)).resolves.not.toThrow();
    });

    it('should throw 404 for non-existent category', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await expect(categoryService.deleteCategory(fakeId)).rejects.toThrow(
        'Category not found',
      );
    });
  });
});
