import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { AuthService } from '../services/authService'
import { config } from '../config/config'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['STUDENT', 'TEACHER', 'PARENT', 'ADMIN']).optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function authRoutes(fastify: FastifyInstance) {
  const authService = new AuthService()

  // Register
  fastify.post(
    '/register',
    {
      schema: {
        description: 'Register a new user',
        tags: ['auth'],
        body: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            name: { type: 'string', minLength: 2 },
            role: { type: 'string', enum: ['STUDENT', 'TEACHER', 'PARENT', 'ADMIN'] },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  name: { type: 'string' },
                  role: { type: 'string' },
                  avatar: { type: 'string', nullable: true },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                },
              },
              token: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = registerSchema.parse(request.body)
        const user = await authService.register(body)

        // Generate JWT token
        const token = fastify.jwt.sign(
          { userId: user.id, email: user.email, role: user.role },
          { expiresIn: config.jwt.expiresIn }
        )

        return reply.code(201).send({
          user,
          token,
        })
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          return reply.code(409).send({
            error: 'User already exists',
            message: error.message,
          })
        }
        throw error
      }
    }
  )

  // Login
  fastify.post(
    '/login',
    {
      schema: {
        description: 'Login user',
        tags: ['auth'],
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  name: { type: 'string' },
                  role: { type: 'string' },
                  avatar: { type: 'string', nullable: true },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                },
              },
              token: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = loginSchema.parse(request.body)
        const user = await authService.login(body)

        if (!user) {
          return reply.code(401).send({
            error: 'Invalid credentials',
            message: 'Email or password is incorrect',
          })
        }

        // Generate JWT token
        const token = fastify.jwt.sign(
          { userId: user.id, email: user.email, role: user.role },
          { expiresIn: config.jwt.expiresIn }
        )

        return reply.send({
          user,
          token,
        })
      } catch (error) {
        throw error
      }
    }
  )

  // Get current user
  fastify.get(
    '/me',
    {
      onRequest: [fastify.authenticate],
      schema: {
        description: 'Get current authenticated user',
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  name: { type: 'string' },
                  role: { type: 'string' },
                  avatar: { type: 'string', nullable: true },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = (request as any).user
      const fullUser = await authService.getUserById(user.userId)

      if (!fullUser) {
        return reply.code(404).send({
          error: 'User not found',
        })
      }

      return reply.send({
        user: fullUser,
      })
    }
  )
}

