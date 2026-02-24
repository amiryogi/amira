import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProducts, useProductBySlug } from '@/hooks/useProducts';
import React from 'react';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('useProducts', () => {
  it('should fetch products list', async () => {
    const { result } = renderHook(() => useProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.success).toBe(true);
    expect(result.current.data?.data).toBeInstanceOf(Array);
    expect(result.current.data?.data.length).toBeGreaterThan(0);
  });

  it('should fetch products with search params', async () => {
    const { result } = renderHook(
      () => useProducts({ search: 'pashmina' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data).toBeDefined();
  });
});

describe('useProductBySlug', () => {
  it('should fetch a product by slug', async () => {
    const { result } = renderHook(
      () => useProductBySlug('pashmina-shawl-classic'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.slug).toBe('pashmina-shawl-classic');
  });

  it('should not fetch when slug is empty', () => {
    const { result } = renderHook(
      () => useProductBySlug(''),
      { wrapper: createWrapper() }
    );

    expect(result.current.fetchStatus).toBe('idle');
  });
});
