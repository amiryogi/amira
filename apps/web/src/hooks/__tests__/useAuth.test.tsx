import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLogin, useLogout } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/auth.store';
import React from 'react';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('useLogin', () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: null, user: null, isAuthenticated: false });
  });

  it('should update auth store on successful login', async () => {
    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ email: 'ram@example.com', password: 'ValidPass1!' });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const authState = useAuthStore.getState();
    expect(authState.isAuthenticated).toBe(true);
    expect(authState.accessToken).toBe('mock-access-token');
    expect(authState.user?.email).toBe('ram@example.com');
  });

  it('should handle login failure', async () => {
    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate({ email: 'wrong@example.com', password: 'WrongPass1!' });
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    const authState = useAuthStore.getState();
    expect(authState.isAuthenticated).toBe(false);
  });
});

describe('useLogout', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: 'token',
      user: {
        _id: 'user-1',
        name: 'Test',
        email: 'test@test.com',
        role: 'USER',
        isVerified: true,
        isDeleted: false,
        tokenVersion: 0,
        password: '',
        createdAt: '',
        updatedAt: '',
      },
      isAuthenticated: true,
    });
  });

  it('should clear auth store on logout', async () => {
    const { result } = renderHook(() => useLogout(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const authState = useAuthStore.getState();
    expect(authState.isAuthenticated).toBe(false);
    expect(authState.accessToken).toBeNull();
    expect(authState.user).toBeNull();
  });
});
