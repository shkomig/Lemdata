import { PrismaClient } from '@prisma/client'
import { config } from './config'

let prisma: PrismaClient

export async function setupDatabase(): Promise<PrismaClient> {
  if (!prisma) {
    prisma = new PrismaClient({
      log: config.server.env === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })

    // Test connection
    try {
      await prisma.$connect()
      console.log('✅ Database connected successfully')
    } catch (error) {
      console.error('❌ Database connection failed:', error)
      throw error
    }
  }

  return prisma
}

export { prisma }

