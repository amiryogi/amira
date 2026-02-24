import { describe, it, expect, beforeEach } from 'vitest';
import supertest from 'supertest';
import {
  createTestApp,
  authenticatedAgent,
  expectSuccess,
  expectError,
  expectPaginated,
} from '../../../test/helpers.js';
import { createTestCategory } from '../../../test/factories/category.factory.js';
import { createTestAdmin, createTestUser } from '../../../test/factories/user.factory.js';
import mongoose from 'mongoose';

const app = createTestApp();

describe('Category Integration Tests', () => {
  describe('GET /api/v1/categories', () => {
    it('should list categories (public)', async () => {
      await createTestCategory({ name: 'Shawls' });
      await createTestCategory({ name: 'Caps' });

      const res = await supertest(app).get('/api/v1/categories').expect(200);

      expectPaginated(res.body);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /api/v1/categories/active', () => {
    it('should return only active categories', async () => {
      await createTestCategory({ isActive: true });
      await createTestCategory({ isActive: false });

      const res = await supertest(app).get('/api/v1/categories/active').expect(200);

      expectSuccess(res.body);
      expect(res.body.data.every((c: { isActive: boolean }) => c.isActive)).toBe(true);
    });
  });

  describe('POST /api/v1/categories (ADMIN)', () => {
    it('should create category as admin', async () => {
      const admin = await createTestAdmin();
      const agent = authenticatedAgent(app, {
        _id: (admin._id as mongoose.Types.ObjectId).toString(),
        role: 'ADMIN',
        tokenVersion: 0,
      });

      const res = await agent.post('/api/v1/categories').send({
        name: 'Dhaka Fabric',
        description: 'Traditional Nepali woven fabric',
      });

      expect(res.status).toBe(201);
      expectSuccess(res.body);
      expect(res.body.data.name).toBe('Dhaka Fabric');
    });

    it('should reject non-admin', async () => {
      const user = await createTestUser();
      const agent = authenticatedAgent(app, {
        _id: (user._id as mongoose.Types.ObjectId).toString(),
        role: 'USER',
        tokenVersion: 0,
      });

      const res = await agent.post('/api/v1/categories').send({
        name: 'Unauthorized',
      });

      expect(res.status).toBe(403);
    });

    it('should reject unauthenticated request', async () => {
      await supertest(app)
        .post('/api/v1/categories')
        .send({ name: 'No Auth' })
        .expect(401);
    });
  });

  describe('PUT /api/v1/categories/:id (ADMIN)', () => {
    it('should update category', async () => {
      const admin = await createTestAdmin();
      const category = await createTestCategory();

      const agent = authenticatedAgent(app, {
        _id: (admin._id as mongoose.Types.ObjectId).toString(),
        role: 'ADMIN',
        tokenVersion: 0,
      });

      const res = await agent
        .put(
          `/api/v1/categories/${(category._id as mongoose.Types.ObjectId).toString()}`,
        )
        .send({ name: 'Updated Category' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Category');
    });
  });

  describe('DELETE /api/v1/categories/:id (ADMIN)', () => {
    it('should soft delete category', async () => {
      const admin = await createTestAdmin();
      const category = await createTestCategory();

      const agent = authenticatedAgent(app, {
        _id: (admin._id as mongoose.Types.ObjectId).toString(),
        role: 'ADMIN',
        tokenVersion: 0,
      });

      const res = await agent.delete(
        `/api/v1/categories/${(category._id as mongoose.Types.ObjectId).toString()}`,
      );
      expect(res.status).toBe(200);
    });
  });
});
