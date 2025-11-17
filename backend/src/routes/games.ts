import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { gameService } from '../services/gameService.js'
import { db } from '../config/database.js'
import { logger } from '../utils/logger.js'
import { sanitize } from '../utils/sanitizer.js'
import {
  GenerateGameRequest,
  GenerateGameResponse,
  SubmitGameAnswersRequest,
  SubmitGameAnswersResponse,
  GameType,
  DifficultyLevel,
} from '../../../shared/types/index.js'

interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string
    email: string
    role: string
  }
}

/**
 * Game Routes - API endpoints for game generation and management
 */
export default async function gameRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/games/generate
   * יוצר משחק אינטרקטיבי חדש מתמונה או טקסט
   */
  fastify.post<{ Body: GenerateGameRequest; Reply: GenerateGameResponse }>(
    '/generate',
    {
      preHandler: fastify.authenticate,
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const { imageId, sourceText, gameType, difficulty, title } = request.body
        const userId = request.user!.id

        // בדיקת קלט
        if (!imageId && !sourceText) {
          return reply.code(400).send({
            error: 'Either imageId or sourceText must be provided',
          })
        }

        let textToUse = sourceText
        let imageIdToUse = imageId

        // אם קיבלנו imageId, נשלוף את הטקסט מהתמונה
        if (imageId) {
          const image = await db.image.findUnique({
            where: { id: imageId },
          })

          if (!image) {
            return reply.code(404).send({ error: 'Image not found' })
          }

          if (image.userId !== userId) {
            return reply.code(403).send({ error: 'Unauthorized access to image' })
          }

          // משתמשים ב-OCR text או ב-analysis
          textToUse = image.ocrText || JSON.stringify(image.analysis) || ''

          if (!textToUse.trim()) {
            return reply.code(400).send({
              error: 'No text found in image. Please upload an image with text content.',
            })
          }
        }

        // ניקוי הטקסט
        textToUse = sanitize(textToUse)

        if (textToUse.length < 50) {
          return reply.code(400).send({
            error: 'Source text is too short. Please provide at least 50 characters.',
          })
        }

        // זיהוי שפה אוטומטי
        const hasHebrew = /[\u0590-\u05FF]/.test(textToUse)
        const hasEnglish = /[a-zA-Z]/.test(textToUse)
        const language = hasHebrew && hasEnglish ? 'mixed' : hasHebrew ? 'he' : 'en'

        logger.info(`Generating game for user ${userId}, language: ${language}`)

        // יצירת המשחק באמצעות AI
        const gameResult = await gameService.generateGame({
          sourceText: textToUse,
          gameType: gameType as GameType | undefined,
          difficulty: difficulty as DifficultyLevel | undefined,
          language,
        })

        // שמירת המשחק בבסיס הנתונים
        const game = await db.game.create({
          data: {
            userId,
            imageId: imageIdToUse,
            title: title || gameResult.title,
            description: gameResult.description,
            type: gameResult.type,
            difficulty: gameResult.difficulty,
            content: gameResult.content as any,
            sourceText: textToUse.substring(0, 5000), // מגביל לאורך סביר
            aiModel: 'gemini-pro',
            metadata: {
              language,
              generatedAt: new Date().toISOString(),
            },
            isPublic: false,
          },
        })

        // עדכון אנליטיקס
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        await db.userAnalytics.upsert({
          where: {
            userId_date: {
              userId,
              date: today,
            },
          },
          update: {
            gamesCreated: { increment: 1 },
            aiCostTotal: { increment: gameResult.cost },
          },
          create: {
            userId,
            date: today,
            gamesCreated: 1,
            aiCostTotal: gameResult.cost,
          },
        })

        logger.info(`Game created successfully: ${game.id}`)

        return reply.code(201).send({
          game: {
            ...game,
            createdAt: game.createdAt.toISOString(),
            updatedAt: game.updatedAt.toISOString(),
          },
          cost: gameResult.cost,
          model: 'gemini-pro',
        })
      } catch (error) {
        logger.error('Error generating game:', error)
        return reply.code(500).send({
          error: 'Failed to generate game',
          details: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }
  )

  /**
   * GET /api/games
   * מחזיר את כל המשחקים של המשתמש
   */
  fastify.get(
    '/',
    {
      preHandler: fastify.authenticate,
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const userId = request.user!.id

        const games = await db.game.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          include: {
            image: {
              select: {
                id: true,
                originalName: true,
                url: true,
              },
            },
            _count: {
              select: {
                gameSessions: true,
              },
            },
          },
        })

        return reply.send({
          games: games.map((game) => ({
            ...game,
            createdAt: game.createdAt.toISOString(),
            updatedAt: game.updatedAt.toISOString(),
            sessionsCount: game._count.gameSessions,
          })),
        })
      } catch (error) {
        logger.error('Error fetching games:', error)
        return reply.code(500).send({ error: 'Failed to fetch games' })
      }
    }
  )

  /**
   * GET /api/games/:id
   * מחזיר משחק ספציפי
   */
  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: fastify.authenticate,
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params
        const userId = request.user!.id

        const game = await db.game.findUnique({
          where: { id },
          include: {
            image: true,
            gameSessions: {
              where: { userId },
              orderBy: { startedAt: 'desc' },
              take: 5,
            },
          },
        })

        if (!game) {
          return reply.code(404).send({ error: 'Game not found' })
        }

        // בדיקת הרשאות - רק אם המשחק פרטי
        if (!game.isPublic && game.userId !== userId) {
          return reply.code(403).send({ error: 'Unauthorized access to game' })
        }

        return reply.send({
          game: {
            ...game,
            createdAt: game.createdAt.toISOString(),
            updatedAt: game.updatedAt.toISOString(),
            gameSessions: game.gameSessions.map((session) => ({
              ...session,
              startedAt: session.startedAt.toISOString(),
              completedAt: session.completedAt?.toISOString(),
            })),
          },
        })
      } catch (error) {
        logger.error('Error fetching game:', error)
        return reply.code(500).send({ error: 'Failed to fetch game' })
      }
    }
  )

  /**
   * POST /api/games/:id/play
   * שולח תשובות ומקבל הערכה
   */
  fastify.post<{
    Params: { id: string }
    Body: SubmitGameAnswersRequest
    Reply: SubmitGameAnswersResponse
  }>(
    '/:id/play',
    {
      preHandler: fastify.authenticate,
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const { id: gameId } = request.params
        const { sessionId, answers, timeSpent } = request.body
        const userId = request.user!.id

        // שליפת המשחק
        const game = await db.game.findUnique({
          where: { id: gameId },
        })

        if (!game) {
          return reply.code(404).send({ error: 'Game not found' })
        }

        // הערכת התשובות
        const evaluation = gameService.evaluateGameAnswers(game, answers)

        // יצירת או עדכון session
        let session
        if (sessionId) {
          // עדכון session קיים
          session = await db.gameSession.update({
            where: { id: sessionId },
            data: {
              score: evaluation.score,
              maxScore: evaluation.maxScore,
              completed: true,
              completedAt: new Date(),
              timeSpent,
              answers: answers as any,
            },
          })
        } else {
          // יצירת session חדש
          session = await db.gameSession.create({
            data: {
              userId,
              gameId,
              score: evaluation.score,
              maxScore: evaluation.maxScore,
              completed: true,
              completedAt: new Date(),
              timeSpent,
              answers: answers as any,
            },
          })

          // עדכון אנליטיקס
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          await db.userAnalytics.upsert({
            where: {
              userId_date: {
                userId,
                date: today,
              },
            },
            update: {
              gamesPlayed: { increment: 1 },
            },
            create: {
              userId,
              date: today,
              gamesPlayed: 1,
            },
          })
        }

        return reply.send({
          session: {
            ...session,
            startedAt: session.startedAt.toISOString(),
            completedAt: session.completedAt?.toISOString(),
          },
          feedback: {
            correct: evaluation.correct,
            incorrect: evaluation.incorrect,
            percentage: evaluation.percentage,
            details: evaluation.details,
          },
        })
      } catch (error) {
        logger.error('Error submitting game answers:', error)
        return reply.code(500).send({ error: 'Failed to submit answers' })
      }
    }
  )

  /**
   * DELETE /api/games/:id
   * מוחק משחק
   */
  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: fastify.authenticate,
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params
        const userId = request.user!.id

        const game = await db.game.findUnique({
          where: { id },
        })

        if (!game) {
          return reply.code(404).send({ error: 'Game not found' })
        }

        if (game.userId !== userId) {
          return reply.code(403).send({ error: 'Unauthorized to delete this game' })
        }

        await db.game.delete({
          where: { id },
        })

        logger.info(`Game deleted: ${id}`)

        return reply.send({ message: 'Game deleted successfully' })
      } catch (error) {
        logger.error('Error deleting game:', error)
        return reply.code(500).send({ error: 'Failed to delete game' })
      }
    }
  )

  /**
   * GET /api/games/:id/sessions
   * מחזיר את כל ה-sessions של משחק
   */
  fastify.get<{ Params: { id: string } }>(
    '/:id/sessions',
    {
      preHandler: fastify.authenticate,
    },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const { id: gameId } = request.params
        const userId = request.user!.id

        const sessions = await db.gameSession.findMany({
          where: {
            gameId,
            userId,
          },
          orderBy: { startedAt: 'desc' },
        })

        return reply.send({
          sessions: sessions.map((session) => ({
            ...session,
            startedAt: session.startedAt.toISOString(),
            completedAt: session.completedAt?.toISOString(),
          })),
        })
      } catch (error) {
        logger.error('Error fetching game sessions:', error)
        return reply.code(500).send({ error: 'Failed to fetch sessions' })
      }
    }
  )
}
