import { FastifyInstance } from 'fastify'
import { authRoutes } from './auth'
import { chatRoutes } from './chat'
import { imageRoutes } from './images'
import { analyticsRoutes } from './analytics'
import gameRoutes from './games.js'

export async function setupRoutes(fastify: FastifyInstance) {
  // Health check
  fastify.get('/health', async (request, reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }
  })

  // API routes
  await fastify.register(authRoutes, { prefix: '/api/auth' })
  await fastify.register(chatRoutes, { prefix: '/api/chat' })
  await fastify.register(imageRoutes, { prefix: '/api/images' })
  await fastify.register(analyticsRoutes, { prefix: '/api/analytics' })
  await fastify.register(gameRoutes, { prefix: '/api/games' })
}

