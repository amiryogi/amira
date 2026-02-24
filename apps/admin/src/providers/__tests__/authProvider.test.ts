import { describe, it, expect, vi } from 'vitest';
import { authProvider } from '@/providers/authProvider';
import { setAccessToken, getAccessToken } from '@/providers/api';

describe('authProvider', () => {
  describe('login', () => {
    it('should return success and set token on valid credentials', async () => {
      const result = await authProvider.login({ email: 'admin@amira.com', password: 'AdminPass1!' });
      expect(result.success).toBe(true);
      expect(result.redirectTo).toBe('/');
      expect(getAccessToken()).toBe('mock-admin-token');
    });

    it('should return failure on invalid credentials', async () => {
      const result = await authProvider.login({ email: 'bad@example.com', password: 'wrong' });
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should clear access token and redirect to login', async () => {
      setAccessToken('some-token');
      const result = await authProvider.logout({});
      expect(result.success).toBe(true);
      expect(result.redirectTo).toBe('/login');
      expect(getAccessToken()).toBe('');
    });
  });

  describe('check', () => {
    it('should return authenticated when token exists', async () => {
      setAccessToken('valid-token');
      const result = await authProvider.check({});
      expect(result.authenticated).toBe(true);
    });

    it('should attempt refresh when no token exists', async () => {
      setAccessToken('');
      const result = await authProvider.check({});
      // MSW returns refresh token successfully
      expect(result.authenticated).toBe(true);
    });
  });

  describe('getIdentity', () => {
    it('should return admin identity from profile endpoint', async () => {
      setAccessToken('valid-token');
      const identity = await authProvider.getIdentity?.({});
      expect(identity).toBeDefined();
      expect(identity?.name).toBe('Admin User');
      expect(identity?.email).toBe('admin@amira.com');
    });
  });

  describe('getPermissions', () => {
    it('should return ADMIN role', async () => {
      setAccessToken('valid-token');
      const permissions = await authProvider.getPermissions?.({});
      expect(permissions).toBe('ADMIN');
    });
  });
});
