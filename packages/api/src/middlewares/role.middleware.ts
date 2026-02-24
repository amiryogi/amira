import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@amira/shared';
import { ApiError } from '../common/ApiError.js';

export const roleMiddleware = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized('Authentication required'));
      return;
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      next(ApiError.forbidden('Insufficient permissions'));
      return;
    }

    next();
  };
};
