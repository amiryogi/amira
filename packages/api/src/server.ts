import http from 'http';
import { app } from './app.js';
import { config } from './config/index.js';
import { connectDB } from './config/database.js';
import { initializeSocket } from './config/socket.js';
import { logger } from './utils/logger.js';

const start = async (): Promise<void> => {
  await connectDB();

  const httpServer = http.createServer(app);
  initializeSocket(httpServer);

  httpServer.listen(config.port, () => {
    logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
  });

  // Graceful shutdown
  const shutdown = () => {
    logger.info('Shutting down gracefully...');
    httpServer.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

start().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
