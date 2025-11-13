import Fastify, { FastifyInstance } from 'fastify'
import { setupPlugins } from './plugins'
import { setupRoutes } from './routes'
import { errorHandler } from './middleware/errorHandler'
import { db } from './services/database'
import { cache } from './services/cache'
import { config } from './config/config'
import { logger } from './utils/logger'

async function createServer(): Promise<FastifyInstance> {
  // Initialize Fastify with Pino logger
  const fastify = Fastify({
    logger: true,
    trustProxy: true,
    ignoreTrailingSlash: true,
    maxParamLength: 100,
    bodyLimit: 10 * 1024 * 1024, // 10MB
    keepAliveTimeout: 30000,
    requestTimeout: 30000,
    connectionTimeout: 10000,
    disableRequestLogging: false,
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'requestId',
  })

  try {
    // Initialize database connection
    await db.connect()
    logger.info('✅ Database connected successfully')

    // Initialize Redis cache
    await cache.connect()
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
        await db.disconnect()
        await cache.disconnect()
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

    await server.listen({
      port: config.server.port,
      host: config.server.host,
    })

    logger.info(`🚀 Lemdata Backend Server running at http://${config.server.host}:${config.server.port}`)
    logger.info(`📖 API Documentation: http://${config.server.host}:${config.server.port}/docs`)
    logger.info(`🔍 Health Check: http://${config.server.host}:${config.server.port}/health`)

    // Keep the process running
    await new Promise(() => {}) // Never resolves, keeps server alive

  } catch (error) {
    console.error('Full error details:', error)
    logger.error('Failed to start server', error)
    process.exit(1)
  }
}

// Start the server
if (require.main === module) {
  start()
}

export { createServer }

