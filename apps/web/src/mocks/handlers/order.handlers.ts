import { http, HttpResponse } from 'msw';

const mockOrders = [
  {
    _id: 'order-1',
    user: 'user-1',
    items: [
      {
        product: {
          _id: 'product-1',
          name: 'Dhaka Topi',
          slug: 'dhaka-topi',
          images: [{ url: 'https://example.com/topi.jpg', publicId: 'topi' }],
          price: 800,
        },
        quantity: 2,
        price: 800,
      },
    ],
    shippingAddress: {
      fullName: 'Ram Bahadur',
      phone: '9841234567',
      street: 'Thamel',
      city: 'Kathmandu',
      state: 'Bagmati',
      postalCode: '44600',
      country: 'Nepal',
    },
    paymentMethod: 'COD',
    totalAmount: 1600,
    status: 'PENDING',
    paymentStatus: 'PENDING',
    isDeleted: false,
    createdAt: '2025-01-15T10:00:00.000Z',
    updatedAt: '2025-01-15T10:00:00.000Z',
  },
  {
    _id: 'order-2',
    user: 'user-1',
    items: [
      {
        product: {
          _id: 'product-2',
          name: 'Pashmina Shawl',
          slug: 'pashmina-shawl',
          images: [{ url: 'https://example.com/shawl.jpg', publicId: 'shawl' }],
          price: 3500,
        },
        quantity: 1,
        price: 3500,
      },
    ],
    shippingAddress: {
      fullName: 'Ram Bahadur',
      phone: '9841234567',
      street: 'Thamel',
      city: 'Kathmandu',
      state: 'Bagmati',
      postalCode: '44600',
      country: 'Nepal',
    },
    paymentMethod: 'ESEWA',
    totalAmount: 3500,
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    isDeleted: false,
    createdAt: '2025-01-14T08:00:00.000Z',
    updatedAt: '2025-01-14T12:00:00.000Z',
  },
];

export const orderHandlers = [
  http.get('/api/v1/orders', () => {
    return HttpResponse.json({
      success: true,
      message: 'Orders retrieved',
      data: mockOrders,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    });
  }),

  http.get('/api/v1/orders/:id', ({ params }) => {
    const order = mockOrders.find((o) => o._id === params.id);
    if (!order) {
      return HttpResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }
    return HttpResponse.json({
      success: true,
      message: 'Order retrieved',
      data: order,
    });
  }),

  http.post('/api/v1/orders', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newOrder = {
      _id: 'order-new',
      user: 'user-1',
      items: body.items,
      shippingAddress: body.shippingAddress,
      paymentMethod: body.paymentMethod,
      totalAmount: body.totalAmount,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(
      { success: true, message: 'Order created', data: newOrder },
      { status: 201 }
    );
  }),
];
