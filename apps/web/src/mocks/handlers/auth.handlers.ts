import { http, HttpResponse, delay } from 'msw';

const mockUser = {
  _id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'USER',
  phone: '+977-9841234567',
  isVerified: true,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

export const authHandlers = [
  http.post('/api/v1/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    if (body.email === 'test@example.com' && body.password === 'Test@1234') {
      return HttpResponse.json({
        success: true,
        message: 'Login successful',
        data: {
          user: mockUser,
          accessToken: 'mock-access-token',
        },
      });
    }

    return HttpResponse.json(
      {
        success: false,
        message: 'Invalid email or password',
      },
      { status: 401 },
    );
  }),

  http.post('/api/v1/auth/register', async ({ request }) => {
    const body = (await request.json()) as { name: string; email: string };

    if (body.email === 'existing@example.com') {
      return HttpResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 409 },
      );
    }

    return HttpResponse.json(
      {
        success: true,
        message: 'Registration successful',
        data: {
          user: { ...mockUser, name: body.name, email: body.email },
          accessToken: 'mock-access-token',
        },
      },
      { status: 201 },
    );
  }),

  http.post('/api/v1/auth/logout', () => {
    return HttpResponse.json({ success: true, message: 'Logout successful' });
  }),

  http.post('/api/v1/auth/refresh', () => {
    return HttpResponse.json({
      success: true,
      message: 'Token refreshed',
      data: { accessToken: 'refreshed-access-token' },
    });
  }),

  http.post('/api/v1/auth/forgot-password', () => {
    return HttpResponse.json({
      success: true,
      message: 'If the email exists, a reset link has been sent',
    });
  }),

  http.post('/api/v1/auth/reset-password', () => {
    return HttpResponse.json({
      success: true,
      message: 'Password reset successful',
    });
  }),
];
