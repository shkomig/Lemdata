/**
 * Database Service
 * 
 * Centralized database connection and operations.
 * Prevents circular dependencies.
 * 
 * @module services/database
 */

import { PrismaClient } from '@prisma/client'
import { logger } from '../utils/logger'

let prismaInstance: PrismaClient | null = null

/**
 * Get Prisma client instance (singleton)
 */
export function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ],
    })

    // Log slow queries in development
    if (process.env.NODE_ENV === 'development') {
      prismaInstance.$on('query' as any, (e: any) => {
        if (e.duration > 100) {
          logger.warn('Slow query detected', {
            query: e.query,
            duration: e.duration,
            params: e.params,
          })
        }
      })
    }
  }

  return prismaInstance
}

/**
 * Connect to database
 */
export async function connectDatabase(): Promise<PrismaClient> {
  const prisma = getPrisma()
  
  try {
    await prisma.$connect()
    logger.info('Database connected successfully')
    return prisma
  } catch (error) {
    console.error('DATABASE CONNECTION ERROR:', error)
    logger.error('Failed to connect to database', error)
    throw error
  }
}

/**
 * Disconnect from database
 */
export async function disconnectDatabase(): Promise<void> {
  if (prismaInstance) {
    await prismaInstance.$disconnect()
    prismaInstance = null
    logger.info('Database disconnected')
  }
}

/**
 * Check database health
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const prisma = getPrisma()
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    logger.error('Database health check failed', error)
    return false
  }
}

/**
 * Execute in transaction
 */
export async function executeTransaction<T>(
  fn: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  const prisma = getPrisma()
  return await prisma.$transaction(async (tx) => {
    return await fn(tx as PrismaClient)
  })
}

export const db = {
  getPrisma,
  connect: connectDatabase,
  disconnect: disconnectDatabase,
  checkHealth: checkDatabaseHealth,
  transaction: executeTransaction,
}
