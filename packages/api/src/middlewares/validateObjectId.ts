import { Request, Response, NextFunction } from 'express';
import { isValidObjectId } from '../utils/objectId.js';
import { ApiError } from '../common/ApiError.js';

/**
 * Validates that `:id` param is a valid MongoDB ObjectId.
 */
export const validateObjectId = (paramName = 'id') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const id = req.params[paramName];
    if (!id || !isValidObjectId(id)) {
      next(ApiError.badRequest(`Invalid ${paramName}`));
      return;
    }
    next();
  };
};
