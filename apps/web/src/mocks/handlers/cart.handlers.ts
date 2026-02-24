import { http, HttpResponse } from 'msw';

export const cartHandlers = [
  // Cart is client-side only (Zustand with localStorage persist),
  // no backend endpoints needed for cart.
  // These handlers exist for checkout-related flows.

  http.post('/api/v1/orders/checkout', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      {
        success: true,
        message: 'Checkout successful',
        data: {
          _id: 'order-checkout',
          items: body.items,
          totalAmount: body.totalAmount,
          status: 'PENDING',
          paymentMethod: body.paymentMethod,
        },
      },
      { status: 201 }
    );
  }),
];
