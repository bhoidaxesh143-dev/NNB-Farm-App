import { StatusCodes } from 'http-status-codes';
import logger from '../utils/logger.js';
import AppError from '../utils/AppError.js';
import { errorResponse } from '../utils/response.js';
import config from '../config/index.js';

/**
 * Global error handling middleware
 */
export function errorHandler(err, req, res, next) {
  let error = err;

  // Log error
  logger.error('Error:', {
    correlationId: req.correlationId,
    message: err.message,
    stack: err.stack,
    ...(err.code && { code: err.code }),
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((e) => e.message).join(', ');
    error = new AppError(message, StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR');
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    error = new AppError(
      `Duplicate value for field: ${field}`,
      StatusCodes.CONFLICT,
      'DUPLICATE_ERROR'
    );
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    error = new AppError(
      'Invalid ID format',
      StatusCodes.BAD_REQUEST,
      'INVALID_ID'
    );
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError(
      'Invalid token',
      StatusCodes.UNAUTHORIZED,
      'INVALID_TOKEN'
    );
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError(
      'Token expired',
      StatusCodes.UNAUTHORIZED,
      'TOKEN_EXPIRED'
    );
  }

  // Prepare response
  const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = error.message || 'Internal server error';
  const code = error.code || 'INTERNAL_ERROR';

  // Don't leak error details in production
  const details = config.nodeEnv === 'development' ? {
    stack: error.stack,
  } : undefined;

  return errorResponse(res, message, statusCode, code, details);
}

