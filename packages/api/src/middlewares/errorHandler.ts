import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../common/ApiError.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(config.nodeEnv !== 'production' && { stack: err.stack }),
    });
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      error: err.message,
    });
    return;
  }

  // Mongoose duplicate key
  if (err.name === 'MongoServerError' && (err as Record<string, unknown>).code === 11000) {
    res.status(409).json({
      success: false,
      message: 'Duplicate entry',
    });
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Token expired',
    });
    return;
  }

  logger.error('Unhandled error:', err);

  res.status(500).json({
    success: false,
    message: config.nodeEnv === 'production' ? 'Internal server error' : err.message,
  });
}
