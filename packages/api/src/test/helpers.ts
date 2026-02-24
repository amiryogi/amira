import express from 'express';
import cookieParser from 'cookie-parser';
import { registerRoutes } from '../routes/index.js';
import { errorHandler } from '../middlewares/errorHandler.js';
import jwt from 'jsonwebtoken';
import type { IUserDocument } from '../modules/user/user.model.js';
import supertest from 'supertest';

/**
 * Create a fully configured Express app for integration tests.
 * Does NOT start a server — pass to supertest directly.
 */
export function createTestApp() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  registerRoutes(app);

  app.use(errorHandler);

  return app;
}

/**
 * Generate a valid access token for a test user.
 */
export function generateTestAccessToken(user: {
  _id: string;
  role: string;
  tokenVersion?: number;
}): string {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
      tokenVersion: user.tokenVersion ?? 0,
    },
    process.env.ACCESS_SECRET || 'test-access-secret-key-for-ci',
    { expiresIn: '15m' },
  );
}

/**
 * Get a supertest agent with auth header pre-set.
 */
export function authenticatedAgent(
  app: express.Express,
  user: { _id: string; role: string; tokenVersion?: number },
) {
  const token = generateTestAccessToken(user);
  return {
    get: (url: string) => supertest(app).get(url).set('Authorization', `Bearer ${token}`),
    post: (url: string) => supertest(app).post(url).set('Authorization', `Bearer ${token}`),
    put: (url: string) => supertest(app).put(url).set('Authorization', `Bearer ${token}`),
    patch: (url: string) => supertest(app).patch(url).set('Authorization', `Bearer ${token}`),
    delete: (url: string) => supertest(app).delete(url).set('Authorization', `Bearer ${token}`),
  };
}

/**
 * Assert standard successful API response shape.
 */
export function expectSuccess(body: Record<string, unknown>) {
  expect(body).toHaveProperty('success', true);
  expect(body).toHaveProperty('message');
}

/**
 * Assert standard error API response shape.
 */
export function expectError(body: Record<string, unknown>, statusCode?: number) {
  expect(body).toHaveProperty('success', false);
  expect(body).toHaveProperty('message');
}

/**
 * Assert paginated API response shape.
 */
export function expectPaginated(body: Record<string, unknown>) {
  expect(body).toHaveProperty('success', true);
  expect(body).toHaveProperty('data');
  expect(body).toHaveProperty('pagination');
  expect(body.pagination).toHaveProperty('page');
  expect(body.pagination).toHaveProperty('limit');
  expect(body.pagination).toHaveProperty('total');
  expect(body.pagination).toHaveProperty('totalPages');
}
