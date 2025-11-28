import express from 'express';
import config from '../config/index.js';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import healthRoutes from './healthRoutes.js';
import { applyErrorHandlers } from '../middleware/index.js';

/**
 * Apply all routes to the Express app
 * @param {import('express').Application} app - Express application
 */
export function applyRoutes(app) {
  // Health check routes (outside API versioning)
  app.use('/', healthRoutes);

  // API routes
  const apiRouter = express.Router();
  
  apiRouter.use('/auth', authRoutes);
  apiRouter.use('/users', userRoutes);

  // Mount API router
  app.use(`/api/${config.apiVersion}`, apiRouter);

  // Apply error handlers (must be after routes)
  applyErrorHandlers(app);
}

