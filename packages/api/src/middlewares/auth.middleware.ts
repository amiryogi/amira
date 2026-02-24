import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { ApiError } from '../common/ApiError.js';
import { User } from '../modules/user/user.model.js';
import type { IUserDocument } from '../modules/user/user.model.js';

interface JwtPayload {
  userId: string;
  role: string;
  tokenVersion: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.accessSecret) as JwtPayload;

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    if (user.isDeleted) {
      throw ApiError.unauthorized('Account has been deactivated');
    }

    // Check tokenVersion for forced logout
    if (decoded.tokenVersion !== user.tokenVersion) {
      throw ApiError.unauthorized('Token has been invalidated');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
      return;
    }
    next(ApiError.unauthorized('Invalid or expired token'));
  }
};
