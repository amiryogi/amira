import { http, HttpResponse } from 'msw';

const mockCategories = [
  { _id: 'category-1', name: 'Pashmina Shawls', slug: 'pashmina-shawls', description: 'Finest pashmina', isActive: true, isDeleted: false, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
  { _id: 'category-2', name: 'Woolen Sweaters', slug: 'woolen-sweaters', description: 'Hand-knit sweaters', isActive: true, isDeleted: false, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
  { _id: 'category-3', name: 'Felt Products', slug: 'felt-products', description: 'Handmade felt items', isActive: true, isDeleted: false, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
];

export const categoryHandlers = [
  http.get('/api/v1/categories', () => {
    return HttpResponse.json({
      success: true,
      message: 'Categories retrieved',
      data: mockCategories,
      pagination: { page: 1, limit: 10, total: 3, totalPages: 1 },
    });
  }),

  http.get('/api/v1/categories/active', () => {
    return HttpResponse.json({
      success: true,
      message: 'Active categories retrieved',
      data: mockCategories.filter((c) => c.isActive),
    });
  }),
];
