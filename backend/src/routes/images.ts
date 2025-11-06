import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import multipart from '@fastify/multipart'
import { AIService } from '../services/aiService'
import { prisma } from '../server'
import { logger } from '../utils/logger'

export async function imageRoutes(fastify: FastifyInstance) {
  // Register multipart plugin
  await fastify.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  })

  const aiService = new AIService()

  // Upload and analyze image
  fastify.post(
    '/upload',
    {
      onRequest: [fastify.authenticate],
      schema: {
        description: 'Upload and analyze an image',
        tags: ['images'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = (request as any).user
      const data = await (request as any).file()

      if (!data) {
        return reply.code(400).send({
          error: 'No file provided',
          message: 'Please upload an image file',
        })
      }

      try {
        // Read file buffer
        const buffer = await data.toBuffer()
        
        // Convert to base64 for Gemini Vision
        const base64 = buffer.toString('base64')

        // Analyze image with AI
        const analysis = await aiService.analyzeImage(base64, user.userId)

        // Save image metadata to database
        // In production, you'd upload to S3/MinIO
        const image = await prisma.image.create({
          data: {
            userId: user.userId,
            url: `data:${data.mimetype};base64,${base64}`, // Temporary - should use proper storage
            originalName: data.filename || 'image.jpg',
            size: buffer.length,
            mimeType: data.mimetype || 'image/jpeg',
            ocrText: analysis.ocrText,
            analysis: analysis,
          },
        })

        // Update user analytics
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        await prisma.userAnalytics.upsert({
          where: {
            userId_date: {
              userId: user.userId,
              date: today,
            },
          },
          update: {
            imagesUploaded: { increment: 1 },
          },
          create: {
            userId: user.userId,
            date: today,
            imagesUploaded: 1,
          },
        })

        return reply.send({
          image,
          analysis,
        })
      } catch (error: any) {
        logger.error('Image upload error', error)
        return reply.code(500).send({
          error: 'Failed to process image',
          message: error.message,
        })
      }
    }
  )

  // Get user images
  fastify.get(
    '/',
    {
      onRequest: [fastify.authenticate],
      schema: {
        description: 'Get user uploaded images',
        tags: ['images'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = (request as any).user

      const images = await prisma.image.findMany({
        where: { userId: user.userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      })

      return reply.send({ images })
    }
  )

  // Get image by ID
  fastify.get(
    '/:id',
    {
      onRequest: [fastify.authenticate],
      schema: {
        description: 'Get image by ID',
        tags: ['images'],
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = (request as any).user
      const id = (request.params as any).id

      const image = await prisma.image.findFirst({
        where: {
          id,
          userId: user.userId,
        },
      })

      if (!image) {
        return reply.code(404).send({
          error: 'Image not found',
        })
      }

      return reply.send({ image })
    }
  )
}
