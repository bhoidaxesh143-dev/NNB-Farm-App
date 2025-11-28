import { createClient } from 'redis';
import config from './index.js';
import logger from '../utils/logger.js';

let redisClient = null;

/**
 * Connect to Redis
 */
export async function connectRedis() {
  try {
    redisClient = createClient({
      socket: {
        host: config.redis.host,
        port: config.redis.port,
      },
      password: config.redis.password || undefined,
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected');
    });

    redisClient.on('reconnecting', () => {
      logger.warn('Redis reconnecting');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    await redisClient.connect();
  } catch (error) {
    logger.error('Redis connection failed:', error);
    // Don't throw - allow app to run without Redis
    logger.warn('Running without Redis cache');
  }
}

/**
 * Disconnect from Redis
 */
export async function disconnectRedis() {
  if (redisClient) {
    try {
      await redisClient.quit();
      logger.info('Redis connection closed');
    } catch (error) {
      logger.error('Error closing Redis connection:', error);
    }
  }
}

/**
 * Get Redis client instance
 */
export function getRedisClient() {
  return redisClient;
}

/**
 * Check Redis health
 */
export async function checkRedisHealth() {
  if (!redisClient) return false;
  
  try {
    await redisClient.ping();
    return true;
  } catch (error) {
    return false;
  }
}

