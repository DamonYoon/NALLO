import { Request, Response, NextFunction } from 'express';
import { AppError, toErrorResponse } from '@/utils/errors';
import { logger } from '@/utils/logger';

/**
 * Global error handling middleware
 */
export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error
  if (error instanceof AppError) {
    logger.warn('Application error', {
      code: error.code,
      statusCode: error.statusCode,
      path: req.path,
      method: req.method,
      details: error.details,
    });
  } else {
    logger.error('Unexpected error', error, {
      path: req.path,
      method: req.method,
    });
  }

  // Send error response
  const errorResponse = toErrorResponse(error);
  const statusCode = error instanceof AppError ? error.statusCode : 500;

  res.status(statusCode).json(errorResponse);
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}
