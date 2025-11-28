import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import config from '../config/index.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';

/**
 * Protect routes - verify JWT token
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError(
      'Not authorized to access this route',
      StatusCodes.UNAUTHORIZED,
      'NO_TOKEN'
    );
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      throw new AppError(
        'User no longer exists',
        StatusCodes.UNAUTHORIZED,
        'USER_NOT_FOUND'
      );
    }

    next();
  } catch (error) {
    throw new AppError(
      'Not authorized to access this route',
      StatusCodes.UNAUTHORIZED,
      'INVALID_TOKEN'
    );
  }
});

/**
 * Authorize specific roles
 * @param  {...string} roles - Allowed roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError(
        'Not authorized to access this route',
        StatusCodes.FORBIDDEN,
        'INSUFFICIENT_PERMISSIONS'
      );
    }
    next();
  };
};

