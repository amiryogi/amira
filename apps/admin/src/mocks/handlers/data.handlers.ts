import { http, HttpResponse } from 'msw';

const mockProducts = [
  { _id: 'prod-1', name: 'Pashmina Shawl', slug: 'pashmina-shawl', price: 3500, stock: 25, category: { _id: 'cat-1', name: 'Shawls' }, images: [{ url: '/shawl.jpg', publicId: 'shawl' }], isActive: true, isFeatured: true, isDeleted: false, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' },
  { _id: 'prod-2', name: 'Dhaka Topi', slug: 'dhaka-topi', price: 800, stock: 50, category: { _id: 'cat-2', name: 'Accessories' }, images: [{ url: '/topi.jpg', publicId: 'topi' }], isActive: true, isFeatured: false, isDeleted: false, createdAt: '2025-01-02T00:00:00.000Z', updatedAt: '2025-01-02T00:00:00.000Z' },
  { _id: 'prod-3', name: 'Woolen Sweater', slug: 'woolen-sweater', price: 2200, stock: 15, category: { _id: 'cat-1', name: 'Shawls' }, images: [], isActive: true, isFeatured: false, isDeleted: false, createdAt: '2025-01-03T00:00:00.000Z', updatedAt: '2025-01-03T00:00:00.000Z' },
];

const mockOrders = [
  { _id: 'order-1', user: { name: 'Ram Bahadur', email: 'ram@example.com' }, totalAmount: 3500, paymentMethod: 'ESEWA', paymentStatus: 'PAID', status: 'CONFIRMED', items: [{ product: mockProducts[0], quantity: 1, price: 3500 }], createdAt: '2025-01-15T10:00:00.000Z' },
  { _id: 'order-2', user: { name: 'Sita Devi', email: 'sita@example.com' }, totalAmount: 1600, paymentMethod: 'COD', paymentStatus: 'PENDING', status: 'PENDING', items: [{ product: mockProducts[1], quantity: 2, price: 800 }], createdAt: '2025-01-16T08:00:00.000Z' },
];

const mockUsers = [
  { _id: 'user-1', name: 'Ram Bahadur', email: 'ram@example.com', role: 'USER', isVerified: true, isActive: true, isDeleted: false, createdAt: '2025-01-01T00:00:00.000Z' },
  { _id: 'user-2', name: 'Sita Devi', email: 'sita@example.com', role: 'USER', isVerified: true, isActive: true, isDeleted: false, createdAt: '2025-01-02T00:00:00.000Z' },
  { _id: 'admin-1', name: 'Admin User', email: 'admin@amira.com', role: 'ADMIN', isVerified: true, isActive: true, isDeleted: false, createdAt: '2025-01-01T00:00:00.000Z' },
];

const mockCategories = [
  { _id: 'cat-1', name: 'Shawls', slug: 'shawls', isActive: true, isDeleted: false },
  { _id: 'cat-2', name: 'Accessories', slug: 'accessories', isActive: true, isDeleted: false },
];

export const dataHandlers = [
  // Products
  http.get('/api/v1/products', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || '1');
    const limit = Number(url.searchParams.get('limit') || '10');
    return HttpResponse.json({
      success: true,
      data: mockProducts,
      pagination: { page, limit, total: mockProducts.length, totalPages: 1 },
    });
  }),

  http.get('/api/v1/products/:id', ({ params }) => {
    const product = mockProducts.find((p) => p._id === params.id);
    if (!product) return HttpResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    return HttpResponse.json({ success: true, data: product });
  }),

  http.post('/api/v1/products', () => {
    return HttpResponse.json({ success: true, data: { ...mockProducts[0], _id: 'prod-new' } }, { status: 201 });
  }),

  http.put('/api/v1/products/:id', () => {
    return HttpResponse.json({ success: true, data: mockProducts[0] });
  }),

  http.delete('/api/v1/products/:id', () => {
    return HttpResponse.json({ success: true, message: 'Product deleted' });
  }),

  // Orders
  http.get('/api/v1/orders', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || '1');
    const limit = Number(url.searchParams.get('limit') || '10');
    return HttpResponse.json({
      success: true,
      data: mockOrders,
      pagination: { page, limit, total: mockOrders.length, totalPages: 1 },
    });
  }),

  http.get('/api/v1/orders/:id', ({ params }) => {
    const order = mockOrders.find((o) => o._id === params.id);
    if (!order) return HttpResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    return HttpResponse.json({ success: true, data: order });
  }),

  http.put('/api/v1/orders/:id', () => {
    return HttpResponse.json({ success: true, data: mockOrders[0] });
  }),

  // Users
  http.get('/api/v1/users', () => {
    return HttpResponse.json({
      success: true,
      data: mockUsers,
      pagination: { page: 1, limit: 10, total: mockUsers.length, totalPages: 1 },
    });
  }),

  // Categories
  http.get('/api/v1/categories', () => {
    return HttpResponse.json({
      success: true,
      data: mockCategories,
      pagination: { page: 1, limit: 10, total: mockCategories.length, totalPages: 1 },
    });
  }),

  http.post('/api/v1/categories', () => {
    return HttpResponse.json({ success: true, data: mockCategories[0] }, { status: 201 });
  }),

  http.put('/api/v1/categories/:id', () => {
    return HttpResponse.json({ success: true, data: mockCategories[0] });
  }),

  http.delete('/api/v1/categories/:id', () => {
    return HttpResponse.json({ success: true, message: 'Category deleted' });
  }),
];
