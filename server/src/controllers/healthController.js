import { StatusCodes } from 'http-status-codes';
import { checkDatabaseHealth } from '../config/database.js';
import { checkRedisHealth } from '../config/redis.js';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * @route   GET /health
 * @desc    Health check endpoint (liveness probe)
 * @access  Public
 */
export const healthCheck = asyncHandler(async (req, res) => {
  successResponse(res, { status: 'OK' }, 'Service is healthy');
});

/**
 * @route   GET /readiness
 * @desc    Readiness check endpoint (readiness probe)
 * @access  Public
 */
export const readinessCheck = asyncHandler(async (req, res) => {
  const checks = {
    database: await checkDatabaseHealth(),
    redis: await checkRedisHealth(),
  };

  const isReady = Object.values(checks).every((check) => check);

  if (isReady) {
    successResponse(res, { status: 'READY', checks }, 'Service is ready');
  } else {
    errorResponse(
      res,
      'Service is not ready',
      StatusCodes.SERVICE_UNAVAILABLE,
      'NOT_READY',
      checks
    );
  }
});

