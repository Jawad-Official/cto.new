import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { HttpStatus } from '../utils/constants';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.error(`Operational Error: ${err.message}`, {
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
    });

    return res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode,
    });
  }

  logger.error('Unexpected Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    error: 'Internal server error',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  });
};

export const notFound = (req: Request, res: Response) => {
  res.status(HttpStatus.NOT_FOUND).json({
    error: 'Route not found',
    statusCode: HttpStatus.NOT_FOUND,
  });
};
