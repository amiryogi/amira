import { setupServer } from 'msw/node';
import { authHandlers } from './handlers/auth.handlers';
import { productHandlers } from './handlers/product.handlers';
import { orderHandlers } from './handlers/order.handlers';
import { categoryHandlers } from './handlers/category.handlers';
import { cartHandlers } from './handlers/cart.handlers';

export const server = setupServer(
  ...authHandlers,
  ...productHandlers,
  ...orderHandlers,
  ...categoryHandlers,
  ...cartHandlers
);
