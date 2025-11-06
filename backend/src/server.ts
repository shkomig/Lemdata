import Fastify, { FastifyInstance } from 'fastify'
import { setupPlugins } from './plugins'
import { setupRoutes } from './routes'
import { errorHandler } from './middleware/errorHandler'
import { setupDatabase } from './config/database'
import { setupCache } from './config/cache'
import { config } from './config/config'
import { logger } from './utils/logger'

// Global variables for shared resources
export let prisma: Awaited<ReturnType<typeof setupDatabase>>
export let redis: Awaited<ReturnType<typeof setupCache>>

async function createServer(): Promise<FastifyInstance> {
  // Initialize Fastify with high-performance settings
  const fastify = Fastify({
    logger: config.server.env === 'development',
    trustProxy: true,
    ignoreTrailingSlash: true,
    maxParamLength: 100,
    bodyLimit: 10 * 1024 * 1024, // 10MB
    keepAliveTimeout: 30000,
    requestTimeout: 30000,
    connectionTimeout: 10000,
  })

  try {
    // Initialize database connection
    prisma = await setupDatabase()
    logger.info('✅ Database connected successfully')

    // Initialize Redis cache
    redis = await setupCache()
    logger.info('✅ Redis cache connected successfully')

    // Setup plugins (CORS, Auth, Rate limiting, etc.)
    await setupPlugins(fastify)
    logger.info('✅ Plugins loaded successfully')

    // Setup error handling
    fastify.setErrorHandler(errorHandler)

    // Setup routes
    await setupRoutes(fastify)
    logger.info('✅ Routes loaded successfully')

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`)

      try {
        await fastify.close()
        await prisma.$disconnect()
        if (redis) {
          await redis.quit()
        }
        process.exit(0)
      } catch (error) {
        logger.error('Error during shutdown', error)
        process.exit(1)
      }
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))

  } catch (error) {
    logger.error('Failed to start server', error)
    process.exit(1)
  }

  return fastify
}

async function start() {
  try {
    const server = await createServer()

    const address = await server.listen({
      port: config.server.port,
      host: config.server.host,
    })

    logger.info(`🚀 Lemdata Backend Server running at ${address}`)
    logger.info(`📖 API Documentation: ${address}/docs`)
    logger.info(`🔍 Health Check: ${address}/health`)

  } catch (error) {
    logger.error('Failed to start server', error)
    process.exit(1)
  }
}

// Start the server
if (require.main === module) {
  start()
}

export { createServer }

