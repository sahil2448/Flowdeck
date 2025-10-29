import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import logger from '../config/logger'; // ✅ Add this

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Default error
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: any[] = [];

  // AppError (our custom errors)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    if ('errors' in err) {
      errors = (err as any).errors;
    }
  }
  
  // Zod validation errors
  else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    errors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
  }
  
  // Prisma errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;
    
    // Unique constraint violation
    if (err.code === 'P2002') {
      message = 'A record with this value already exists';
      const field = (err.meta?.target as string[])?.[0] || 'field';
      errors = [{ field, message: `${field} must be unique` }];
    }
    
    // Record not found
    else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found';
    }
    
    // Foreign key constraint
    else if (err.code === 'P2003') {
      message = 'Related record not found';
    }
  }
  
  // JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Log error for debugging (only in development)
  if (process.env.NODE_ENV !== 'production') {
  //  Replace console.error with logger
  logger.error(`Error: ${err.message}`, {
    statusCode,
    path: req.path,
    method: req.method,
    stack: err.stack,
  });
  }

  // Send error response
  res.status(statusCode).json({
    error: message,
    ...(errors.length > 0 && { details: errors }),
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

// 404 handler for undefined routes
export function notFoundHandler(req: Request, res: Response) {
    logger.warn(`404 - Route not found: ${req.method} ${req.path}`);

  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
}
