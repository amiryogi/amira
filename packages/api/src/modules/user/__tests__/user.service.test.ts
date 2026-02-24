import { describe, it, expect, beforeEach } from 'vitest';
import { UserService } from '../user.service.js';
import { createTestUser, createTestAdmin } from '../../../test/factories/user.factory.js';
import { UserRole } from '@amira/shared';
import mongoose from 'mongoose';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const user = await createTestUser({ name: 'Sita Devi' });
      const result = await userService.getProfile(
        (user._id as mongoose.Types.ObjectId).toString(),
      );

      expect(result.name).toBe('Sita Devi');
      expect(result.email).toBeDefined();
      expect(result).not.toHaveProperty('password');
    });

    it('should throw 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await expect(userService.getProfile(fakeId)).rejects.toThrow('User not found');
    });
  });

  describe('updateProfile', () => {
    it('should update name and phone', async () => {
      const user = await createTestUser();
      const userId = (user._id as mongoose.Types.ObjectId).toString();

      const result = await userService.updateProfile(userId, {
        name: 'Updated Name',
        phone: '+977-9812345678',
      });

      expect(result.name).toBe('Updated Name');
      expect(result.phone).toBe('+977-9812345678');
    });
  });

  describe('listUsers', () => {
    it('should return paginated user list', async () => {
      await createTestUser({ name: 'User A' });
      await createTestUser({ name: 'User B' });
      await createTestUser({ name: 'User C' });

      const result = await userService.listUsers({ page: 1, limit: 2 });

      expect(result.users).toHaveLength(2);
      expect(result.pagination.total).toBe(3);
    });
  });

  describe('updateRole', () => {
    it('should update user role', async () => {
      const user = await createTestUser();
      const admin = await createTestAdmin();
      const userId = (user._id as mongoose.Types.ObjectId).toString();
      const adminId = (admin._id as mongoose.Types.ObjectId).toString();

      const result = await userService.updateRole(userId, UserRole.ADMIN, adminId);
      expect(result.role).toBe(UserRole.ADMIN);
    });

    it('should prevent admin from changing own role', async () => {
      const admin = await createTestAdmin();
      const adminId = (admin._id as mongoose.Types.ObjectId).toString();

      await expect(
        userService.updateRole(adminId, UserRole.USER, adminId),
      ).rejects.toThrow('Cannot change your own role');
    });
  });

  describe('softDeleteUser', () => {
    it('should soft delete user', async () => {
      const user = await createTestUser();
      const admin = await createTestAdmin();
      const userId = (user._id as mongoose.Types.ObjectId).toString();
      const adminId = (admin._id as mongoose.Types.ObjectId).toString();

      await expect(userService.softDeleteUser(userId, adminId)).resolves.not.toThrow();
    });

    it('should prevent admin from deleting own account', async () => {
      const admin = await createTestAdmin();
      const adminId = (admin._id as mongoose.Types.ObjectId).toString();

      await expect(userService.softDeleteUser(adminId, adminId)).rejects.toThrow(
        'Cannot delete your own account',
      );
    });
  });
});
