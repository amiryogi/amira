import { describe, it, expect } from 'vitest';
import supertest from 'supertest';
import {
  createTestApp,
  authenticatedAgent,
  expectSuccess,
  expectPaginated,
} from '../../../test/helpers.js';
import { createTestUser, createTestAdmin } from '../../../test/factories/user.factory.js';
import { createTestOrder } from '../../../test/factories/order.factory.js';
import { OrderStatus } from '@amira/shared';
import mongoose from 'mongoose';

const app = createTestApp();

describe('Order Integration Tests', () => {
  describe('GET /api/v1/orders (USER)', () => {
    it('should require authentication', async () => {
      await supertest(app).get('/api/v1/orders').expect(401);
    });

    it('should return user orders', async () => {
      const user = await createTestUser();
      const userId = user._id as mongoose.Types.ObjectId;
      await createTestOrder({ userId });

      const agent = authenticatedAgent(app, {
        _id: userId.toString(),
        role: 'USER',
        tokenVersion: 0,
      });

      const res = await agent.get('/api/v1/orders');
      expect(res.status).toBe(200);
      expectPaginated(res.body);
    });
  });

  describe('GET /api/v1/orders/:id', () => {
    it('should return order for owner', async () => {
      const user = await createTestUser();
      const userId = user._id as mongoose.Types.ObjectId;
      const order = await createTestOrder({ userId });

      const agent = authenticatedAgent(app, {
        _id: userId.toString(),
        role: 'USER',
        tokenVersion: 0,
      });

      const res = await agent.get(
        `/api/v1/orders/${(order._id as mongoose.Types.ObjectId).toString()}`,
      );
      expect(res.status).toBe(200);
      expectSuccess(res.body);
    });

    it('should return 403 for non-owner', async () => {
      const owner = await createTestUser();
      const other = await createTestUser();
      const order = await createTestOrder({
        userId: owner._id as mongoose.Types.ObjectId,
      });

      const agent = authenticatedAgent(app, {
        _id: (other._id as mongoose.Types.ObjectId).toString(),
        role: 'USER',
        tokenVersion: 0,
      });

      const res = await agent.get(
        `/api/v1/orders/${(order._id as mongoose.Types.ObjectId).toString()}`,
      );
      expect(res.status).toBe(403);
    });

    it('should allow admin to view any order', async () => {
      const user = await createTestUser();
      const admin = await createTestAdmin();
      const order = await createTestOrder({
        userId: user._id as mongoose.Types.ObjectId,
      });

      const agent = authenticatedAgent(app, {
        _id: (admin._id as mongoose.Types.ObjectId).toString(),
        role: 'ADMIN',
        tokenVersion: 0,
      });

      const res = await agent.get(
        `/api/v1/orders/${(order._id as mongoose.Types.ObjectId).toString()}`,
      );
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/v1/orders/admin/all (ADMIN)', () => {
    it('should require admin role', async () => {
      const user = await createTestUser();
      const agent = authenticatedAgent(app, {
        _id: (user._id as mongoose.Types.ObjectId).toString(),
        role: 'USER',
        tokenVersion: 0,
      });

      const res = await agent.get('/api/v1/orders/admin/all');
      expect(res.status).toBe(403);
    });

    it('should return all orders for admin', async () => {
      const admin = await createTestAdmin();
      await createTestOrder();
      await createTestOrder();

      const agent = authenticatedAgent(app, {
        _id: (admin._id as mongoose.Types.ObjectId).toString(),
        role: 'ADMIN',
        tokenVersion: 0,
      });

      const res = await agent.get('/api/v1/orders/admin/all');
      expect(res.status).toBe(200);
      expectPaginated(res.body);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('PATCH /api/v1/orders/:id/status (ADMIN)', () => {
    it('should update order status', async () => {
      const admin = await createTestAdmin();
      const order = await createTestOrder();

      const agent = authenticatedAgent(app, {
        _id: (admin._id as mongoose.Types.ObjectId).toString(),
        role: 'ADMIN',
        tokenVersion: 0,
      });

      const res = await agent
        .put(
          `/api/v1/orders/${(order._id as mongoose.Types.ObjectId).toString()}/status`,
        )
        .send({ orderStatus: OrderStatus.CONFIRMED });

      expect(res.status).toBe(200);
      expect(res.body.data.orderStatus).toBe(OrderStatus.CONFIRMED);
    });
  });
});
