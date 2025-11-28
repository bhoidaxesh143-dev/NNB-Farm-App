import { disconnectDatabase } from '../config/database.js';
import { disconnectRedis } from '../config/redis.js';
import logger from './logger.js';

/**
 * Gracefully shutdown the server
 * @param {import('http').Server} server - HTTP server instance
 */
export async function gracefulShutdown(server) {
  logger.info('Received shutdown signal, starting graceful shutdown...');

  // Stop accepting new connections
  server.close(() => {
    logger.info('HTTP server closed');
  });

  try {
    // Close database connections
    await disconnectDatabase();
    await disconnectRedis();

    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }

  // Force shutdown after timeout
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

