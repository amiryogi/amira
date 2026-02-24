import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ApiError } from '../common/ApiError.js';

type ValidationTarget = 'body' | 'query' | 'params';

export const validateRequest = (schema: ZodSchema, target: ValidationTarget = 'body') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      const message = Object.entries(errors)
        .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`)
        .join('; ');
      next(ApiError.badRequest(message));
      return;
    }

    // Replace with parsed (and coerced) values
    req[target] = result.data;
    next();
  };
};
