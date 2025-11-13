import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { AuthService } from '../services/authService'
import { config } from '../config/config'
import { sanitizeEmail, sanitizeString } from '../utils/sanitizer'
import { checkPasswordStrength } from '../utils/password'
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  name: z.string().min(2),
  role: z.enum(['STUDENT', 'TEACHER', 'PARENT', 'ADMIN']).optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function authRoutes(fastify: FastifyInstance) {
  const authService = new AuthService()

  // Get CSRF token
  fastify.get(
    '/csrf-token',
    {
      schema: {
        description: 'Get CSRF token for form submissions',
        tags: ['auth'],
        response: {
          200: {
            type: 'object',
            properties: {
              token: { type: 'string' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const token = await reply.generateCsrf()
      return reply.send({ token })
    }
  )

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
      const requestBody = request.body as any
      try {
        console.log('Register request received:', { email: requestBody?.email, name: requestBody?.name })
        
        const body = registerSchema.parse(requestBody)
        
        console.log('Register schema validation passed')
        
        // Sanitize inputs
        const sanitizedData = {
          email: sanitizeEmail(body.email),
          password: body.password, // Passwords should not be sanitized, only validated
          name: sanitizeString(body.name),
          role: body.role,
        }
        
        console.log('Calling authService.register...')
        const user = await authService.register(sanitizedData)
        console.log('User registered successfully:', user.id)

        // Generate JWT token
        const token = fastify.jwt.sign(
          { userId: user.id, email: user.email, role: user.role },
          { expiresIn: config.jwt.expiresIn }
        )

        console.log('JWT token generated')

        return reply.code(201).send({
          user,
          token,
        })
      } catch (error: any) {
        console.error('Register error:', error)
        if (error.message?.includes('already exists')) {
          throw new ConflictError('User with this email already exists', {
            details: { email: requestBody.email },
            path: request.url,
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
        
        // Sanitize email input
        const sanitizedData = {
          email: sanitizeEmail(body.email),
          password: body.password, // Passwords should not be sanitized
        }
        
        const user = await authService.login(sanitizedData)

        if (!user) {
          throw new UnauthorizedError('Invalid email or password', {
            path: request.url,
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
        // Log the error for debugging
        fastify.log.error({ error }, 'Login error')
        throw error
      }
    }
  )

  // Check password strength (helper endpoint)
  fastify.post(
    '/check-password',
    {
      schema: {
        description: 'Check password strength',
        tags: ['auth'],
        body: {
          type: 'object',
          required: ['password'],
          properties: {
            password: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              score: { type: 'number' },
              label: { type: 'string' },
              feedback: { type: 'array', items: { type: 'string' } },
              isValid: { type: 'boolean' },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { password } = request.body as { password: string }
      
      if (!password || typeof password !== 'string') {
        return reply.code(400).send({
          error: 'Invalid request',
          message: 'Password is required',
        })
      }

      const strength = checkPasswordStrength(password)
      
      return reply.send({
        score: strength.score,
        label: strength.score === 0 ? 'Very Weak' :
               strength.score === 1 ? 'Weak' :
               strength.score === 2 ? 'Fair' :
               strength.score === 3 ? 'Strong' : 'Very Strong',
        feedback: strength.feedback,
        isValid: strength.isValid,
      })
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
        throw new NotFoundError('User not found', {
          userId: user.userId,
          path: request.url,
        })
      }

      return reply.send({
        user: fullUser,
      })
    }
  )
}

