import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { AIService } from '../services/aiService'
import { db } from '../services/database'
import { sanitizeString, checkMaxLength, checkProhibitedContent } from '../utils/sanitizer'
import { BadRequestError, NotFoundError } from '../utils/errors'

const chatSchema = z.object({
  message: z.string().min(1).max(5000),
  conversationId: z.string().uuid().optional(),
  preferredModel: z.enum(['auto', 'gemini', 'huggingface', 'ollama']).optional(),
})

export async function chatRoutes(fastify: FastifyInstance) {
  const aiService = new AIService()

  // Chat endpoint
  fastify.post(
    '/chat',
    {
      onRequest: [fastify.authenticate],
      schema: {
        description: 'Send a chat message to AI',
        tags: ['chat'],
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['message'],
          properties: {
            message: { type: 'string', minLength: 1, maxLength: 5000 },
            conversationId: { type: 'string', format: 'uuid' },
            preferredModel: {
              type: 'string',
              enum: ['auto', 'gemini', 'huggingface', 'ollama'],
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              text: { type: 'string' },
              model: { type: 'string' },
              cost: { type: 'number' },
              conversationId: { type: 'string' },
              metadata: { type: 'object' },
              suggestions: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = (request as any).user
        const body = chatSchema.parse(request.body)

        // Sanitize and validate message
        const sanitizedMessage = sanitizeString(body.message)
        checkMaxLength(sanitizedMessage, 5000, 'Message')
        
        // Check for prohibited content
        const contentCheck = checkProhibitedContent(sanitizedMessage)
        if (!contentCheck.safe) {
          throw new BadRequestError(contentCheck.reason || 'Message contains prohibited content', {
            details: { message: sanitizedMessage.substring(0, 100) },
            path: request.url,
          })
        }

        // Get conversation history if conversationId exists
        let history: Array<{ role: 'user' | 'assistant'; content: string }> = []
        if (body.conversationId) {
          const prisma = db.getPrisma()
          const messages = await prisma.message.findMany({
            where: { conversationId: body.conversationId },
            orderBy: { createdAt: 'asc' },
            take: 10,
          })

          history = messages.map((msg: any) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          }))
        }

        const response = await aiService.generateResponse({
          message: sanitizedMessage,
          conversationId: body.conversationId,
          userId: user.userId,
          history,
          preferredModel: body.preferredModel,
        })

        return reply.send(response)
      } catch (error: any) {
        if (error.name === 'ZodError') {
          return reply.code(400).send({
            error: 'Validation Error',
            message: error.message,
            details: error.errors,
          })
        }
        throw error
      }
    }
  )

  // Get conversations
  fastify.get(
    '/conversations',
    {
      onRequest: [fastify.authenticate],
      schema: {
        description: 'Get user conversations',
        tags: ['chat'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = (request as any).user

      const prisma = db.getPrisma()
      const conversations = await prisma.conversation.findMany({
        where: { userId: user.userId },
        orderBy: { updatedAt: 'desc' },
        take: 50,
        include: {
          _count: {
            select: { messages: true },
          },
        },
      })

      return reply.send({ conversations })
    }
  )

  // Get conversation messages
  fastify.get(
    '/conversations/:conversationId/messages',
    {
      onRequest: [fastify.authenticate],
      schema: {
        description: 'Get messages from a conversation',
        tags: ['chat'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            conversationId: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = (request as any).user
      const conversationId = (request.params as any).conversationId

      const prisma = db.getPrisma()
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId: user.userId,
        },
      })

      if (!conversation) {
        throw new NotFoundError('Conversation not found', {
          details: { conversationId },
          userId: user.userId,
          path: request.url,
        })
      }

      const messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
      })

      return reply.send({ messages })
    }
  )

  // Get AI models status
  fastify.get(
    '/models/status',
    {
      onRequest: [fastify.authenticate],
      schema: {
        description: 'Get available AI models status',
        tags: ['chat'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const status = await aiService.getModelsStatus()
      return reply.send({ models: status })
    }
  )
}

