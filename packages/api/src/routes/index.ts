import { Express } from 'express';
import { authRoutes } from '../modules/auth/auth.routes.js';
import { userRoutes } from '../modules/user/user.routes.js';
import { addressRoutes } from '../modules/address/address.routes.js';
import { categoryRoutes } from '../modules/category/category.routes.js';
import { productRoutes } from '../modules/product/product.routes.js';
import { orderRoutes } from '../modules/order/order.routes.js';
import { paymentRoutes } from '../modules/payment/payment.routes.js';
import { reviewRoutes } from '../modules/review/review.routes.js';
import { searchRoutes } from '../modules/search/search.routes.js';
import { notificationRoutes } from '../modules/notification/notification.routes.js';
import { analyticsRoutes } from '../modules/analytics/analytics.routes.js';
import { chatRoutes } from '../modules/chat/chat.routes.js';

const API_PREFIX = '/api/v1';

export function registerRoutes(app: Express): void {
  app.use(`${API_PREFIX}/auth`, authRoutes);
  app.use(`${API_PREFIX}/users`, userRoutes);
  app.use(`${API_PREFIX}/users/addresses`, addressRoutes);
  app.use(`${API_PREFIX}/categories`, categoryRoutes);
  app.use(`${API_PREFIX}/products`, productRoutes);
  app.use(`${API_PREFIX}/orders`, orderRoutes);
  app.use(`${API_PREFIX}/payments`, paymentRoutes);
  app.use(`${API_PREFIX}/reviews`, reviewRoutes);
  app.use(`${API_PREFIX}/search`, searchRoutes);
  app.use(`${API_PREFIX}/notifications`, notificationRoutes);
  app.use(`${API_PREFIX}/analytics`, analyticsRoutes);
  app.use(`${API_PREFIX}/chat`, chatRoutes);
}
