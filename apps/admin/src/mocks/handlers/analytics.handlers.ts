import { http, HttpResponse } from 'msw';

const mockSummary = {
  totalRevenue: 450000,
  totalOrders: 128,
  totalProducts: 45,
  totalUsers: 312,
};

const mockMonthlyRevenue = [
  { _id: { year: 2025, month: 1 }, revenue: 32000, count: 12 },
  { _id: { year: 2025, month: 2 }, revenue: 45000, count: 18 },
  { _id: { year: 2025, month: 3 }, revenue: 38000, count: 15 },
];

const mockOrderStatus = [
  { _id: 'PENDING', count: 12 },
  { _id: 'CONFIRMED', count: 28 },
  { _id: 'SHIPPED', count: 35 },
  { _id: 'DELIVERED', count: 48 },
  { _id: 'CANCELLED', count: 5 },
];

const mockTopProducts = [
  { _id: 'prod-1', totalSold: 45, revenue: 135000, name: 'Pashmina Shawl' },
  { _id: 'prod-2', totalSold: 32, revenue: 96000, name: 'Dhaka Topi' },
  { _id: 'prod-3', totalSold: 28, revenue: 84000, name: 'Woolen Sweater' },
];

const mockPaymentMethods = [
  { _id: 'COD', count: 65, total: 195000 },
  { _id: 'ESEWA', count: 63, total: 255000 },
];

export const analyticsHandlers = [
  http.get('/api/v1/analytics/dashboard', () => {
    return HttpResponse.json({ success: true, data: mockSummary });
  }),

  http.get('/api/v1/analytics/revenue/monthly', () => {
    return HttpResponse.json({ success: true, data: mockMonthlyRevenue });
  }),

  http.get('/api/v1/analytics/orders/status', () => {
    return HttpResponse.json({ success: true, data: mockOrderStatus });
  }),

  http.get('/api/v1/analytics/products/top', () => {
    return HttpResponse.json({ success: true, data: mockTopProducts });
  }),

  http.get('/api/v1/analytics/revenue/payment-method', () => {
    return HttpResponse.json({ success: true, data: mockPaymentMethods });
  }),
];
