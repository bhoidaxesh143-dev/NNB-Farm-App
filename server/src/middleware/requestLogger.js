import logger from '../utils/logger.js';
import { randomUUID } from 'crypto';

/**
 * Request logging middleware
 */
export function requestLogger(req, res, next) {
  // Add correlation ID to request
  req.correlationId = req.headers['x-correlation-id'] || randomUUID();
  res.setHeader('X-Correlation-ID', req.correlationId);

  const start = Date.now();

  // Log request
  logger.info('Incoming request', {
    correlationId: req.correlationId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      correlationId: req.correlationId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
}

