import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../server'

export async function analyticsRoutes(fastify: FastifyInstance) {
  // Get user analytics
  fastify.get(
    '/',
    {
      onRequest: [fastify.authenticate],
      schema: {
        description: 'Get user analytics',
        tags: ['analytics'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = (request as any).user

      // Get current analytics
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const todayAnalytics = await prisma.userAnalytics.findFirst({
        where: {
          userId: user.userId,
          date: {
            gte: today,
          },
        },
      })

      // Get last 30 days analytics
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const historyAnalytics = await prisma.userAnalytics.findMany({
        where: {
          userId: user.userId,
          date: {
            gte: thirtyDaysAgo,
          },
        },
        orderBy: {
          date: 'asc',
        },
      })

      // Calculate totals
      const totals = {
        totalQuestions: historyAnalytics.reduce((sum, a) => sum + a.questionsAsked, 0),
        totalCost: historyAnalytics.reduce((sum, a) => sum + a.aiCostTotal, 0),
        totalImages: historyAnalytics.reduce((sum, a) => sum + a.imagesUploaded, 0),
        geminiQueries: historyAnalytics.reduce((sum, a) => sum + a.aiQueriesGemini, 0),
        huggingQueries: historyAnalytics.reduce((sum, a) => sum + a.aiQueriesHugging, 0),
        localQueries: historyAnalytics.reduce((sum, a) => sum + a.aiQueriesLocal, 0),
      }

      return reply.send({
        today: todayAnalytics || {
          questionsAsked: 0,
          aiCostTotal: 0,
          imagesUploaded: 0,
          aiQueriesGemini: 0,
          aiQueriesHugging: 0,
          aiQueriesLocal: 0,
        },
        history: historyAnalytics,
        totals,
      })
    }
  )

  // Get conversation statistics
  fastify.get(
    '/conversations',
    {
      onRequest: [fastify.authenticate],
      schema: {
        description: 'Get conversation statistics',
        tags: ['analytics'],
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = (request as any).user

      const conversations = await prisma.conversation.findMany({
        where: { userId: user.userId },
        include: {
          _count: {
            select: { messages: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
      })

      const stats = {
        totalConversations: conversations.length,
        totalMessages: conversations.reduce((sum, c) => sum + c._count.messages, 0),
        averageMessagesPerConversation:
          conversations.length > 0
            ? conversations.reduce((sum, c) => sum + c._count.messages, 0) / conversations.length
            : 0,
      }

      return reply.send({ conversations, stats })
    }
  )
}

