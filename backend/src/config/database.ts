import { PrismaClient } from '@prisma/client'
import { config } from './config'

const prisma = new PrismaClient({
  log: config.server.env === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

export async function setupDatabase(): Promise<PrismaClient> {
  // Test connection
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    console.error('DATABASE CONNECTION ERROR:', error)
    throw error
  }

  return prisma
}

export { prisma }

