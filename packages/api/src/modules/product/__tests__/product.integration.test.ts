import { describe, it, expect, vi } from 'vitest';
import supertest from 'supertest';
import {
  createTestApp,
  authenticatedAgent,
  expectSuccess,
  expectError,
  expectPaginated,
} from '../../../test/helpers.js';
import { createTestCategory } from '../../../test/factories/category.factory.js';
import { createTestProduct } from '../../../test/factories/product.factory.js';
import { createTestUser, createTestAdmin } from '../../../test/factories/user.factory.js';
import mongoose from 'mongoose';

// Mock cloudinary
vi.mock('../../../config/cloudinary.js', () => ({
  cloudinary: {
    uploader: {
      upload_stream: vi.fn(),
      destroy: vi.fn().mockResolvedValue({ result: 'ok' }),
    },
  },
}));

const app = createTestApp();

describe('Product Integration Tests', () => {
  describe('GET /api/v1/products', () => {
    it('should list active products (public)', async () => {
      const category = await createTestCategory();
      await createTestProduct({
        categoryId: category._id as mongoose.Types.ObjectId,
        isActive: true,
      });

      const res = await supertest(app).get('/api/v1/products').expect(200);

      expectPaginated(res.body);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should support pagination', async () => {
      const category = await createTestCategory();
      for (let i = 0; i < 5; i++) {
        await createTestProduct({
          categoryId: category._id as mongoose.Types.ObjectId,
        });
      }

      const res = await supertest(app)
        .get('/api/v1/products?page=1&limit=2')
        .expect(200);

      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination.total).toBe(5);
      expect(res.body.pagination.totalPages).toBe(3);
    });
  });

  describe('GET /api/v1/products/slug/:slug', () => {
    it('should return product by slug', async () => {
      const product = await createTestProduct({ name: 'Slug Product Test' });

      const res = await supertest(app)
        .get(`/api/v1/products/slug/${product.slug}`)
        .expect(200);

      expectSuccess(res.body);
      expect(res.body.data.slug).toBe(product.slug);
    });

    it('should return 404 for non-existent slug', async () => {
      const res = await supertest(app)
        .get('/api/v1/products/slug/does-not-exist')
        .expect(404);

      expectError(res.body);
    });
  });

  describe('GET /api/v1/products/admin/all (ADMIN)', () => {
    it('should require authentication', async () => {
      await supertest(app).get('/api/v1/products/admin/all').expect(401);
    });

    it('should require ADMIN role', async () => {
      const user = await createTestUser();
      const agent = authenticatedAgent(app, {
        _id: (user._id as mongoose.Types.ObjectId).toString(),
        role: 'USER',
        tokenVersion: 0,
      });

      const res = await agent.get('/api/v1/products/admin/all');
      expect(res.status).toBe(403);
    });

    it('should return all products for admin', async () => {
      const admin = await createTestAdmin();
      const agent = authenticatedAgent(app, {
        _id: (admin._id as mongoose.Types.ObjectId).toString(),
        role: 'ADMIN',
        tokenVersion: 0,
      });

      await createTestProduct({ isActive: true });
      await createTestProduct({ isActive: false });

      const res = await agent.get('/api/v1/products/admin/all');
      expect(res.status).toBe(200);
      expectPaginated(res.body);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('DELETE /api/v1/products/:id (ADMIN)', () => {
    it('should soft delete product', async () => {
      const admin = await createTestAdmin();
      const product = await createTestProduct();

      const agent = authenticatedAgent(app, {
        _id: (admin._id as mongoose.Types.ObjectId).toString(),
        role: 'ADMIN',
        tokenVersion: 0,
      });

      const res = await agent.delete(
        `/api/v1/products/${(product._id as mongoose.Types.ObjectId).toString()}`,
      );
      expect(res.status).toBe(200);
    });

    it('should return 404 for non-existent product', async () => {
      const admin = await createTestAdmin();
      const agent = authenticatedAgent(app, {
        _id: (admin._id as mongoose.Types.ObjectId).toString(),
        role: 'ADMIN',
        tokenVersion: 0,
      });

      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await agent.delete(`/api/v1/products/${fakeId}`);
      expect(res.status).toBe(404);
    });
  });
});
