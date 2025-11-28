import { validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import { errorResponse } from '../utils/response.js';

/**
 * Validation middleware
 */
export function validate(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));

    return errorResponse(
      res,
      'Validation failed',
      StatusCodes.BAD_REQUEST,
      'VALIDATION_ERROR',
      formattedErrors
    );
  }

  next();
}

