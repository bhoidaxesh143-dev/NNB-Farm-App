import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import config from '../config/index.js';
import { requestLogger } from './requestLogger.js';
import { errorHandler } from './errorHandler.js';
import { notFound } from './notFound.js';
import { rateLimiter } from './rateLimiter.js';

/**
 * Apply all middleware to the Express app
 * @param {import('express').Application} app - Express application
 */
export function applyMiddleware(app) {
  // Security middleware
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: config.cors.origin,
      credentials: true,
    })
  );

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Compression
  app.use(compression());

  // Sanitize data
  app.use(mongoSanitize());

  // Request logging
  app.use(requestLogger);

  // Rate limiting
  app.use('/api/', rateLimiter);

  // Note: Error handlers are applied after routes
}

/**
 * Apply error handling middleware (should be called after routes)
 * @param {import('express').Application} app - Express application
 */
export function applyErrorHandlers(app) {
  app.use(notFound);
  app.use(errorHandler);
}

