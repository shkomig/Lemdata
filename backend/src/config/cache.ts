import Redis from 'ioredis'
import { config } from './config'

let redis: Redis | null = null

export async function setupCache(): Promise<Redis> {
  if (!redis) {
    redis = new Redis(config.redis.url, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
      maxRetriesPerRequest: 3,
    })

    redis.on('connect', () => {
      console.log('✅ Redis connected successfully')
    })

    redis.on('error', (error) => {
      console.error('❌ Redis connection error:', error)
    })
  }

  return redis
}

export function getRedis(): Redis | null {
  return redis
}

