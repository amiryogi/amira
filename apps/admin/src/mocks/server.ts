import { setupServer } from 'msw/node';
import { authHandlers } from './handlers/auth.handlers';
import { analyticsHandlers } from './handlers/analytics.handlers';
import { dataHandlers } from './handlers/data.handlers';

export const server = setupServer(
  ...authHandlers,
  ...analyticsHandlers,
  ...dataHandlers
);
