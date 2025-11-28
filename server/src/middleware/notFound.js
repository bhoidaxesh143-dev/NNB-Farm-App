import { StatusCodes } from 'http-status-codes';
import { errorResponse } from '../utils/response.js';

/**
 * 404 Not Found middleware
 */
export function notFound(req, res, next) {
  return errorResponse(
    res,
    `Route ${req.originalUrl} not found`,
    StatusCodes.NOT_FOUND,
    'NOT_FOUND'
  );
}

