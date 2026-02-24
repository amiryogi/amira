import { useAuthStore } from '@/store/auth.store';
import { act } from '@testing-library/react-native';

// Mock the auth service
jest.mock('@/services/auth.service', () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    refreshSession: jest.fn(),
  },
}));

const { authService } = require('@/services/auth.service');

const mockUser = {
  _id: 'user-1',
  name: 'Ram Bahadur',
  email: 'ram@example.com',
  role: 'USER' as const,
  phone: '9841234567',
};

describe('Auth Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    act(() => {
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    });
  });

  describe('login', () => {
    it('should authenticate user on successful login', async () => {
      authService.login.mockResolvedValue(mockUser);

      await act(async () => {
        await useAuthStore.getState().login('ram@example.com', 'ValidPass1!');
      });

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(authService.login).toHaveBeenCalledWith({
        email: 'ram@example.com',
        password: 'ValidPass1!',
      });
    });

    it('should throw error on failed login', async () => {
      authService.login.mockRejectedValue(new Error('Invalid credentials'));

      await expect(
        useAuthStore.getState().login('bad@example.com', 'wrong'),
      ).rejects.toThrow('Invalid credentials');

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('register', () => {
    it('should authenticate user on successful registration', async () => {
      authService.register.mockResolvedValue(mockUser);

      await act(async () => {
        await useAuthStore.getState().register('Ram Bahadur', 'ram@example.com', 'ValidPass1!', '9841234567');
      });

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.name).toBe('Ram Bahadur');
    });
  });

  describe('logout', () => {
    it('should clear authentication state', async () => {
      authService.logout.mockResolvedValue(undefined);

      act(() => {
        useAuthStore.setState({ user: mockUser, isAuthenticated: true });
      });

      await act(async () => {
        await useAuthStore.getState().logout();
      });

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('tryRestoreSession', () => {
    it('should restore session with valid refresh token', async () => {
      authService.refreshSession.mockResolvedValue(mockUser);

      await act(async () => {
        await useAuthStore.getState().tryRestoreSession();
      });

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.isLoading).toBe(false);
    });

    it('should set unauthenticated when refresh fails', async () => {
      authService.refreshSession.mockRejectedValue(new Error('No token'));

      await act(async () => {
        await useAuthStore.getState().tryRestoreSession();
      });

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(false);
    });
  });

  describe('setUser', () => {
    it('should update the user', () => {
      act(() => {
        useAuthStore.getState().setUser(mockUser);
      });
      expect(useAuthStore.getState().user).toEqual(mockUser);
    });
  });
});
