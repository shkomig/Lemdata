import { FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import cookie from '@fastify/cookie'
import csrf from '@fastify/csrf-protection'
import { config } from '../config/config'
import { authenticate } from '../middleware/auth'

export async function setupPlugins(fastify: FastifyInstance) {
  // CORS
  await fastify.register(cors, {
    origin: config.cors.origin,
    credentials: true,
  })

  // Cookie support (required for CSRF)
  await fastify.register(cookie, {
    secret: config.jwt.secret,
  })

  // CSRF Protection
  await fastify.register(csrf, {
    cookieOpts: {
      httpOnly: true,
      sameSite: 'strict',
      signed: true,
      secure: config.server.env === 'production',
    },
  })

  // JWT
  await fastify.register(jwt, {
    secret: config.jwt.secret,
    sign: {
      expiresIn: config.jwt.expiresIn,
    },
  })

  // Rate Limiting
  await fastify.register(rateLimit, {
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.timeWindow,
    errorResponseBuilder: (request, context) => {
      return {
        error: 'Too Many Requests',
        message: 'Rate limit exceeded, please try again later',
        retryAfter: Math.round(context.ttl / 1000),
      }
    },
  })

  // Add authenticate decorator
  fastify.decorate('authenticate', authenticate)

  // Swagger Documentation
  if (config.server.env !== 'production') {
    await fastify.register(swagger, {
      openapi: {
        openapi: '3.0.0',
        info: {
          title: 'Lemdata API',
          description: 'API documentation for Lemdata educational platform',
          version: '1.0.0',
        },
        servers: [
          {
            url: `http://localhost:${config.server.port}`,
            description: 'Development server',
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
      },
    })

    await fastify.register(swaggerUi, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: false,
      },
      staticCSP: true,
      transformSpecificationClone: true,
    })
  }
}

