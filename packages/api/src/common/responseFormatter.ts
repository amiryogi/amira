import { Response } from 'express';
import type { ApiResponse as ApiResponseType } from '@amira/shared';

export function sendResponse<T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
): void {
  const response: ApiResponseType<T> = {
    success: statusCode >= 200 && statusCode < 300,
    message,
    data,
  };
  res.status(statusCode).json(response);
}

export function sendPaginatedResponse<T>(
  res: Response,
  message: string,
  data: T[],
  pagination: { page: number; limit: number; total: number; totalPages: number },
): void {
  res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  });
}
