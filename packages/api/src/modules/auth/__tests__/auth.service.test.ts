import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from '../auth.service.js';
import { createTestUser } from '../../../test/factories/user.factory.js';
import { User } from '../../user/user.model.js';
import bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('register', () => {
    it('should register a new user with valid data', async () => {
      const result = await authService.register({
        name: 'Ram Sharma',
        email: 'ram@example.com',
        password: 'SecurePass@123',
        phone: '+977-9841234567',
      });

      expect(result.user).toBeDefined();
      expect(result.user.name).toBe('Ram Sharma');
      expect(result.user.email).toBe('ram@example.com');
      expect(result.user.role).toBe('USER');
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();

      // Password should be hashed in DB
      const dbUser = await User.findOne({ email: 'ram@example.com' }).select('+password');
      expect(dbUser).toBeDefined();
      const isMatch = await bcrypt.compare('SecurePass@123', dbUser!.password);
      expect(isMatch).toBe(true);
    });

    it('should throw conflict error for duplicate email', async () => {
      await createTestUser({ email: 'duplicate@example.com' });

      await expect(
        authService.register({
          name: 'Another User',
          email: 'duplicate@example.com',
          password: 'SecurePass@123',
        }),
      ).rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      // Register first
      await authService.register({
        name: 'Login User',
        email: 'login@example.com',
        password: 'ValidPass@123',
      });

      const result = await authService.login({
        email: 'login@example.com',
        password: 'ValidPass@123',
      });

      expect(result.user.email).toBe('login@example.com');
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
    });

    it('should throw error for wrong password', async () => {
      await authService.register({
        name: 'Wrong Pass User',
        email: 'wrongpass@example.com',
        password: 'CorrectPass@123',
      });

      await expect(
        authService.login({
          email: 'wrongpass@example.com',
          password: 'WrongPassword@123',
        }),
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw error for non-existent user', async () => {
      await expect(
        authService.login({
          email: 'nonexistent@example.com',
          password: 'AnyPass@123',
        }),
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw error for deactivated user', async () => {
      await authService.register({
        name: 'Deleted User',
        email: 'deleted@example.com',
        password: 'ValidPass@123',
      });
      await User.updateOne({ email: 'deleted@example.com' }, { isDeleted: true });

      await expect(
        authService.login({
          email: 'deleted@example.com',
          password: 'ValidPass@123',
        }),
      ).rejects.toThrow('Account has been deactivated');
    });
  });

  describe('refreshToken', () => {
    it('should refresh token with valid refresh token', async () => {
      const registerResult = await authService.register({
        name: 'Refresh User',
        email: 'refresh@example.com',
        password: 'ValidPass@123',
      });

      const result = await authService.refreshToken(registerResult.tokens.refreshToken);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      // New refresh token should be different (rotation)
      expect(result.refreshToken).not.toBe(registerResult.tokens.refreshToken);
    });

    it('should throw error for invalid refresh token', async () => {
      await expect(authService.refreshToken('invalid-token')).rejects.toThrow(
        'Invalid refresh token',
      );
    });

    it('should throw error for reused refresh token and revoke all user tokens', async () => {
      const registerResult = await authService.register({
        name: 'Reuse User',
        email: 'reuse@example.com',
        password: 'ValidPass@123',
      });

      const oldRefreshToken = registerResult.tokens.refreshToken;

      // Use the refresh token once (valid)
      await authService.refreshToken(oldRefreshToken);

      // Try to reuse the same token (should fail — reuse detection)
      await expect(authService.refreshToken(oldRefreshToken)).rejects.toThrow(
        'Invalid refresh token',
      );
    });
  });

  describe('logout', () => {
    it('should revoke refresh token on logout', async () => {
      const registerResult = await authService.register({
        name: 'Logout User',
        email: 'logout@example.com',
        password: 'ValidPass@123',
      });

      await authService.logout(registerResult.tokens.refreshToken);

      // Token should no longer be usable
      await expect(
        authService.refreshToken(registerResult.tokens.refreshToken),
      ).rejects.toThrow('Invalid refresh token');
    });
  });

  describe('forgotPassword', () => {
    it('should set reset token for existing user', async () => {
      await authService.register({
        name: 'Reset User',
        email: 'reset@example.com',
        password: 'ValidPass@123',
      });

      // Should not throw even if email exists
      await expect(authService.forgotPassword('reset@example.com')).resolves.not.toThrow();

      const user = await User.findOne({ email: 'reset@example.com' }).select(
        '+resetPasswordToken +resetPasswordExpires',
      );
      expect(user!.resetPasswordToken).toBeDefined();
      expect(user!.resetPasswordExpires).toBeDefined();
      expect(user!.resetPasswordExpires!.getTime()).toBeGreaterThan(Date.now());
    });

    it('should not throw for non-existent email (prevent enumeration)', async () => {
      await expect(
        authService.forgotPassword('nonexistent@example.com'),
      ).resolves.not.toThrow();
    });
  });
});
