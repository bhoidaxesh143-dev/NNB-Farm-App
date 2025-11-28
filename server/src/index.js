import express from 'express';
import config from './config/index.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { connectRedis, disconnectRedis } from './config/redis.js';
import { applyMiddleware } from './middleware/index.js';
import { applyRoutes } from './routes/index.js';
import logger from './utils/logger.js';
import { gracefulShutdown } from './utils/gracefulShutdown.js';

const app = express();
let server;

/**
 * Start the Express server
 */
async function startServer() {
  try {
    // Connect to databases
    await connectDatabase();
    await connectRedis();

    // Apply middleware
    applyMiddleware(app);

    // Apply routes
    applyRoutes(app);

    // Start server
    server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
      logger.info(`API: http://localhost:${config.port}/api/${config.apiVersion}`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown(server));
    process.on('SIGINT', () => gracefulShutdown(server));

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown(server);
    });

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Rejection:', reason);
      gracefulShutdown(server);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

// Export for testing
export { app, startServer };

