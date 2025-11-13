/**
 * Cache Service
 * 
 * Centralized Redis cache operations.
 * Prevents circular dependencies.
 * 
 * @module services/cache
 */

import Redis from 'ioredis'
import { logger } from '../utils/logger'
import { config } from '../config/config'

let redisInstance: Redis | null = null

/**
 * Get Redis client instance (singleton)
 */
export function getRedis(): Redis {
  if (!redisInstance) {
    redisInstance = new Redis(config.redis.url, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000)
        logger.warn(`Redis connection retry attempt ${times}`, { delay })
        return delay
      },
    })

    redisInstance.on('error', (error) => {
      logger.error('Redis error', error)
    })

    redisInstance.on('connect', () => {
      logger.info('Redis connected')
    })

    redisInstance.on('ready', () => {
      logger.info('Redis ready')
    })

    redisInstance.on('close', () => {
      logger.warn('Redis connection closed')
    })
  }

  return redisInstance
}

/**
 * Connect to Redis
 */
export async function connectCache(): Promise<Redis> {
  const redis = getRedis()
  
  try {
    await redis.ping()
    logger.info('Cache connected successfully')
    return redis
  } catch (error) {
    logger.error('Failed to connect to cache', error)
    throw error
  }
}

/**
 * Disconnect from Redis
 */
export async function disconnectCache(): Promise<void> {
  if (redisInstance) {
    await redisInstance.quit()
    redisInstance = null
    logger.info('Cache disconnected')
  }
}

/**
 * Check cache health
 */
export async function checkCacheHealth(): Promise<boolean> {
  try {
    const redis = getRedis()
    await redis.ping()
    return true
  } catch (error) {
    logger.error('Cache health check failed', error)
    return false
  }
}

/**
 * Get cached value
 */
export async function getCached<T = any>(key: string): Promise<T | null> {
  try {
    const redis = getRedis()
    const value = await redis.get(key)
    return value ? JSON.parse(value) : null
  } catch (error) {
    logger.error('Cache get error', { key, error })
    return null
  }
}

/**
 * Set cached value
 */
export async function setCached(
  key: string,
  value: any,
  ttlSeconds?: number
): Promise<boolean> {
  try {
    const redis = getRedis()
    const serialized = JSON.stringify(value)
    
    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, serialized)
    } else {
      await redis.set(key, serialized)
    }
    
    return true
  } catch (error) {
    logger.error('Cache set error', { key, error })
    return false
  }
}

/**
 * Delete cached value
 */
export async function deleteCached(key: string): Promise<boolean> {
  try {
    const redis = getRedis()
    await redis.del(key)
    return true
  } catch (error) {
    logger.error('Cache delete error', { key, error })
    return false
  }
}

/**
 * Clear cache by pattern
 */
export async function clearCachePattern(pattern: string): Promise<number> {
  try {
    const redis = getRedis()
    const keys = await redis.keys(pattern)
    
    if (keys.length > 0) {
      await redis.del(...keys)
    }
    
    return keys.length
  } catch (error) {
    logger.error('Cache clear pattern error', { pattern, error })
    return 0
  }
}

export const cache = {
  getRedis,
  connect: connectCache,
  disconnect: disconnectCache,
  checkHealth: checkCacheHealth,
  get: getCached,
  set: setCached,
  delete: deleteCached,
  clearPattern: clearCachePattern,
}
