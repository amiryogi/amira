import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/store/auth.store';
import { act } from '@testing-library/react';
import type { IUser } from '@amira/shared';

const mockUser: IUser = {
  _id: 'user-1',
  name: 'Ram Bahadur',
  email: 'ram@example.com',
  phone: '9841234567',
  role: 'USER',
  isActive: true,
  isDeleted: false,
  createdAt: '2025-01-01T00:00:00.000Z' as unknown as Date,
  updatedAt: '2025-01-01T00:00:00.000Z' as unknown as Date,
};

describe('Auth Store', () => {
  beforeEach(() => {
    act(() => {
      useAuthStore.setState({
        accessToken: null,
        user: null,
        isAuthenticated: false,
      });
    });
  });

  describe('login', () => {
    it('should set token, user, and authenticated state', () => {
      act(() => {
        useAuthStore.getState().login('test-token', mockUser);
      });
      const state = useAuthStore.getState();
      expect(state.accessToken).toBe('test-token');
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('logout', () => {
    it('should clear all auth state', () => {
      act(() => {
        useAuthStore.getState().login('test-token', mockUser);
        useAuthStore.getState().logout();
      });
      const state = useAuthStore.getState();
      expect(state.accessToken).toBeNull();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('setAccessToken', () => {
    it('should update only the access token', () => {
      act(() => {
        useAuthStore.getState().login('old-token', mockUser);
        useAuthStore.getState().setAccessToken('new-token');
      });
      const state = useAuthStore.getState();
      expect(state.accessToken).toBe('new-token');
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('setUser', () => {
    it('should update only the user', () => {
      const updatedUser = { ...mockUser, name: 'Sita Devi' };
      act(() => {
        useAuthStore.getState().login('test-token', mockUser);
        useAuthStore.getState().setUser(updatedUser);
      });
      const state = useAuthStore.getState();
      expect(state.user?.name).toBe('Sita Devi');
      expect(state.accessToken).toBe('test-token');
    });
  });

  describe('initial state', () => {
    it('should start unauthenticated', () => {
      const state = useAuthStore.getState();
      expect(state.accessToken).toBeNull();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });
});
