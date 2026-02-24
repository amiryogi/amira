import { describe, it, expect, beforeEach } from 'vitest';
import supertest from 'supertest';
import { createTestApp, expectSuccess, expectError } from '../../../test/helpers.js';
import { User } from '../../user/user.model.js';

const app = createTestApp();

describe('Auth Integration Tests', () => {
  const validUser = {
    name: 'Ram Sharma',
    email: 'ram@integration.com',
    password: 'SecurePass@123',
    phone: '+977-9841234567',
  };

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user and return tokens', async () => {
      const res = await supertest(app)
        .post('/api/v1/auth/register')
        .send(validUser)
        .expect(201);

      expectSuccess(res.body);
      expect(res.body.data.user.email).toBe('ram@integration.com');
      expect(res.body.data.accessToken).toBeDefined();
      // Refresh token should be in cookie
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should return 409 for duplicate email', async () => {
      await supertest(app).post('/api/v1/auth/register').send(validUser);

      const res = await supertest(app)
        .post('/api/v1/auth/register')
        .send(validUser)
        .expect(409);

      expectError(res.body);
      expect(res.body.message).toContain('already registered');
    });

    it('should return 400 for missing required fields', async () => {
      const res = await supertest(app)
        .post('/api/v1/auth/register')
        .send({ email: 'incomplete@test.com' })
        .expect(400);

      expectError(res.body);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await supertest(app).post('/api/v1/auth/register').send(validUser);
    });

    it('should login with valid credentials', async () => {
      const res = await supertest(app)
        .post('/api/v1/auth/login')
        .send({ email: validUser.email, password: validUser.password })
        .expect(200);

      expectSuccess(res.body);
      expect(res.body.data.user.email).toBe(validUser.email);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should return 401 for wrong password', async () => {
      const res = await supertest(app)
        .post('/api/v1/auth/login')
        .send({ email: validUser.email, password: 'WrongPass@123' })
        .expect(401);

      expectError(res.body);
    });

    it('should return 401 for non-existent email', async () => {
      const res = await supertest(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nobody@test.com', password: 'AnyPass@123' })
        .expect(401);

      expectError(res.body);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh token from cookie', async () => {
      const registerRes = await supertest(app)
        .post('/api/v1/auth/register')
        .send(validUser);

      const cookies = registerRes.headers['set-cookie'];

      const res = await supertest(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', cookies)
        .expect(200);

      expectSuccess(res.body);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should refresh token from body', async () => {
      const registerRes = await supertest(app)
        .post('/api/v1/auth/register')
        .send(validUser);

      // Extract refresh token from cookie header
      const cookieHeader = registerRes.headers['set-cookie'];
      const refreshToken = Array.isArray(cookieHeader)
        ? cookieHeader[0].split(';')[0].split('=')[1]
        : cookieHeader.split(';')[0].split('=')[1];

      const res = await supertest(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expectSuccess(res.body);
    });

    it('should return 401 for missing refresh token', async () => {
      const res = await supertest(app)
        .post('/api/v1/auth/refresh')
        .expect(401);

      expect(res.body.message).toContain('Refresh token required');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should clear refresh token cookie', async () => {
      const registerRes = await supertest(app)
        .post('/api/v1/auth/register')
        .send(validUser);

      const cookies = registerRes.headers['set-cookie'];

      const res = await supertest(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', cookies)
        .expect(200);

      expectSuccess(res.body);
    });
  });

  describe('Full auth flow', () => {
    it('should register → login → refresh → logout', async () => {
      // 1. Register
      const registerRes = await supertest(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Flow User',
          email: 'flow@example.com',
          password: 'FlowPass@123',
        })
        .expect(201);

      // 2. Login
      const loginRes = await supertest(app)
        .post('/api/v1/auth/login')
        .send({ email: 'flow@example.com', password: 'FlowPass@123' })
        .expect(200);

      const cookies = loginRes.headers['set-cookie'];

      // 3. Refresh
      const refreshRes = await supertest(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', cookies)
        .expect(200);

      expect(refreshRes.body.data.accessToken).toBeDefined();

      // 4. Logout
      const logoutCookies = refreshRes.headers['set-cookie'];
      await supertest(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', logoutCookies)
        .expect(200);
    });
  });
});
