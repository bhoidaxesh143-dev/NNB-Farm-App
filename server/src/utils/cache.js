import { getRedisClient } from '../config/redis.js';
import config from '../config/index.js';
import logger from './logger.js';

/**
 * Set value in cache
 * @param {string} key - Cache key
 * @param {*} value - Value to cache
 * @param {number} ttl - Time to live in seconds
 */
export async function setCache(key, value, ttl = config.redis.ttl) {
  const client = getRedisClient();
  if (!client) return false;

  try {
    const serialized = JSON.stringify(value);
    await client.setEx(key, ttl, serialized);
    return true;
  } catch (error) {
    logger.error('Cache set error:', error);
    return false;
  }
}

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @returns {Promise<*>} Cached value or null
 */
export async function getCache(key) {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    logger.error('Cache get error:', error);
    return null;
  }
}

/**
 * Delete value from cache
 * @param {string} key - Cache key
 */
export async function deleteCache(key) {
  const client = getRedisClient();
  if (!client) return false;

  try {
    await client.del(key);
    return true;
  } catch (error) {
    logger.error('Cache delete error:', error);
    return false;
  }
}

/**
 * Delete cache keys by pattern
 * @param {string} pattern - Key pattern (e.g., 'user:*')
 */
export async function deleteCachePattern(pattern) {
  const client = getRedisClient();
  if (!client) return false;

  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
    return true;
  } catch (error) {
    logger.error('Cache pattern delete error:', error);
    return false;
  }
}

