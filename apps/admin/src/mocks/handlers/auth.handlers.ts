import { http, HttpResponse } from 'msw';

const mockAdminUser = {
  _id: 'admin-1',
  name: 'Admin User',
  email: 'admin@amira.com',
  role: 'ADMIN',
  isVerified: true,
  isDeleted: false,
  tokenVersion: 0,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

export const authHandlers = [
  http.post('/api/v1/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.email === 'admin@amira.com' && body.password === 'AdminPass1!') {
      return HttpResponse.json({
        success: true,
        message: 'Login successful',
        data: { accessToken: 'mock-admin-token', user: mockAdminUser },
      });
    }
    return HttpResponse.json(
      { success: false, message: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  http.post('/api/v1/auth/logout', () => {
    return HttpResponse.json({ success: true, message: 'Logged out' });
  }),

  http.post('/api/v1/auth/refresh', () => {
    return HttpResponse.json({
      success: true,
      data: { accessToken: 'refreshed-admin-token' },
    });
  }),

  http.get('/api/v1/users/profile', () => {
    return HttpResponse.json({
      success: true,
      data: mockAdminUser,
    });
  }),
];
