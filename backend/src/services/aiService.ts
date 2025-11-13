import { GoogleGenerativeAI } from '@google/generative-ai'
import { config } from '../config/config'
import { AIRouter, AIModel } from './aiRouter'
import { db } from './database'
import { logger } from '../utils/logger'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  message: string
  conversationId?: string
  userId: string
  history?: ChatMessage[]
  preferredModel?: 'auto' | AIModel
}

export interface ChatResponse {
  text: string
  model: AIModel
  cost: number
  conversationId: string
  metadata?: any
  suggestions?: string[]
}

export class AIService {
  private geminiClient: GoogleGenerativeAI | null = null
  private aiRouter: AIRouter

  constructor() {
    this.aiRouter = new AIRouter()

    // Initialize Gemini if API key is available
    if (config.ai.gemini.apiKey) {
      this.geminiClient = new GoogleGenerativeAI(config.ai.gemini.apiKey)
      logger.info('✅ Gemini AI initialized')
    } else {
      logger.warn('⚠️ Gemini API key not configured')
    }
  }

  /**
   * Generate AI response using the optimal model
   */
  async generateResponse(request: ChatRequest): Promise<ChatResponse> {
    const { message, conversationId, userId, history = [], preferredModel } = request

    // Select optimal model
    const selectedModel = await this.aiRouter.selectOptimalModel({
      userId,
      message,
      preferredModel,
    })

    logger.info(`Using model: ${selectedModel} for user: ${userId}`)

    try {
      // Generate response based on selected model
      let response: Omit<ChatResponse, 'conversationId'>
      
      switch (selectedModel) {
        case 'gemini':
          response = await this.generateGeminiResponse(message, history)
          break

        case 'huggingface':
          response = await this.generateHuggingFaceResponse(message, history)
          break

        case 'ollama':
          response = await this.generateOllamaResponse(message, history)
          break

        default:
          throw new Error(`Unsupported model: ${selectedModel}`)
      }

      // Get or create conversation
      const prisma = db.getPrisma()
      const conversation = conversationId
        ? await prisma.conversation.findUnique({ where: { id: conversationId } })
        : await prisma.conversation.create({
            data: {
              userId,
              title: message.substring(0, 50),
            },
          })

      if (!conversation) {
        throw new Error('Conversation not found')
      }

      // Save messages to database
      await Promise.all([
        prisma.message.create({
          data: {
            conversationId: conversation.id,
            userId,
            content: message,
            role: 'user',
          },
        }),
        prisma.message.create({
          data: {
            conversationId: conversation.id,
            userId,
            content: response.text,
            role: 'assistant',
            model: selectedModel,
            cost: response.cost,
            metadata: response.metadata,
          },
        }),
      ])

      // Update user analytics
      await this.updateUserAnalytics(userId, selectedModel, response.cost)

      return {
        ...response,
        conversationId: conversation.id,
      }
    } catch (error: any) {
      logger.error('Error generating AI response', error)

      // Fallback to simple response
      const fallbackModel = selectedModel
      if (fallbackModel !== 'gemini' && this.geminiClient) {
        logger.info('Falling back to Gemini...')
        try {
          const fallbackResponse = await this.generateGeminiResponse(message, history)
          // Get or create conversation for fallback
          const prisma = db.getPrisma()
          const conversation = conversationId
            ? await prisma.conversation.findUnique({ where: { id: conversationId } })
            : await prisma.conversation.create({
                data: {
                  userId,
                  title: message.substring(0, 50),
                },
              })

          if (conversation) {
            return {
              ...fallbackResponse,
              conversationId: conversation.id,
            }
          }
        } catch (fallbackError) {
          logger.error('Fallback also failed', fallbackError)
        }
      }

      throw new Error(error.message || 'Failed to generate response')
    }
  }

  /**
   * Generate response using Google Gemini
   */
  private async generateGeminiResponse(
    message: string,
    history: ChatMessage[]
  ): Promise<Omit<ChatResponse, 'conversationId'>> {
    if (!this.geminiClient) {
      throw new Error('Gemini API not configured')
    }

    const model = this.geminiClient.getGenerativeModel({ model: 'gemini-pro' })

    // Build conversation history
    const systemPrompt = `אתה עוזר חינוכי חכם ומקצועי במערכת Lemdata.
אתה מסייע לתלמידים, מורים והורים בשאלות חינוכיות בעברית.
אתה מקפיד על תשובות מדויקות, ברורות ומעודדות.
אם השאלה בעברית, תשיב בעברית. אם באנגלית, תשיב באנגלית.
היה ידידותי, סבלני ומעודד.`

    const startTime = Date.now()

    // Convert history format for Gemini
    const chatHistory = history
      .slice(-10) // Last 10 messages
      .map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }))

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: 'שלום! אני כאן לעזור לך. איך אני יכול לעזור היום?' }],
        },
        ...chatHistory,
      ],
    })

    const result = await chat.sendMessage(message)
    const response = result.response
    const text = response.text()

    const processingTime = Date.now() - startTime
    const cost = this.aiRouter.estimateCost('gemini', message.length, text.length)

    return {
      text,
      model: 'gemini',
      cost,
      metadata: {
        processingTime,
        usage: (result.response as any).usageMetadata?.() || null,
      },
    }
  }

  /**
   * Generate response using Hugging Face (fallback)
   */
  private async generateHuggingFaceResponse(
    message: string,
    history: ChatMessage[]
  ): Promise<Omit<ChatResponse, 'conversationId'>> {
    // For now, return a simple fallback message
    // In the future, can integrate with Hugging Face Inference API
    const startTime = Date.now()

    // Simple rule-based response for demonstration
    const response = `אני מבין את שאלתך. המערכת נמצאת בפיתוח ומודל Hugging Face יושלם בקרוב.
בשאלות מורכבות, אנא נסה שוב בעוד כמה רגעים או השתמש במודל Gemini.`

    const processingTime = Date.now() - startTime

    return {
      text: response,
      model: 'huggingface',
      cost: 0,
      metadata: {
        processingTime,
        note: 'Hugging Face integration coming soon',
      },
    }
  }

  /**
   * Generate response using Ollama (local)
   */
  private async generateOllamaResponse(
    message: string,
    history: ChatMessage[]
  ): Promise<Omit<ChatResponse, 'conversationId'>> {
    const ollamaHost = config.ai.ollama.host
    const ollamaModel = config.ai.ollama.model

    const startTime = Date.now()

    try {
      // Build conversation context
      const conversationText = history
        .slice(-5)
        .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n')

      const fullPrompt = conversationText
        ? `${conversationText}\nUser: ${message}\nAssistant:`
        : `אתה עוזר חינוכי חכם. ענה בעברית אם השאלה בעברית.\n\nUser: ${message}\nAssistant:`

      const response = await fetch(`${ollamaHost}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: ollamaModel,
          prompt: fullPrompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
          },
        }),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`)
      }

      const data = await response.json() as { response?: string }
      const processingTime = Date.now() - startTime

      return {
        text: data.response || 'מצטער, לא הצלחתי לעבד את הבקשה',
        model: 'ollama',
        cost: 0, // Local model is free
        metadata: {
          processingTime,
          model: ollamaModel,
          localModel: true,
        },
      }
    } catch (error: any) {
      logger.error('Ollama error', error)

      // Return helpful fallback
      return {
        text: 'מצטער, המודל המקומי לא זמין כעת. אנסה לעזור לך באמצעים אחרים.',
        model: 'ollama',
        cost: 0,
        metadata: {
          error: 'Local model unavailable',
          fallback: true,
        },
      }
    }
  }

  /**
   * Analyze image using Gemini Vision
   */
  async analyzeImage(imageBase64: string, userId: string): Promise<any> {
    if (!this.geminiClient) {
      throw new Error('Gemini API not configured')
    }

    try {
      const model = this.geminiClient.getGenerativeModel({ model: 'gemini-pro-vision' })

      const prompt = `בצע OCR על התמונה בעברית, זהה את הנושא (מתמטיקה, פיזיקה, כימיה, וכו'), והערך את רמת הקושי.
תן תשובה בפורמט JSON עם השדות: ocrText, language, confidence, summary, topics (מערך), difficulty.`

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageBase64,
            mimeType: 'image/jpeg',
          },
        },
      ])

      const response = result.response
      const text = response.text()

      // Try to parse JSON from response
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0])
        }
      } catch {
        // If parsing fails, return structured data from text
      }

      return {
        ocrText: text.substring(0, 1000),
        language: /[\u0590-\u05FF]/.test(text) ? 'he' : 'en',
        confidence: 0.8,
        summary: 'ניתוח תמונה הושלם',
        topics: ['כללי'],
        difficulty: 'INTERMEDIATE',
        rawResponse: text,
      }
    } catch (error: any) {
      logger.error('Image analysis error', error)
      throw new Error(`Failed to analyze image: ${error.message}`)
    }
  }

  /**
   * Update user analytics
   */
  private async updateUserAnalytics(userId: string, model: AIModel, cost: number): Promise<void> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const prisma = db.getPrisma()
      await prisma.userAnalytics.upsert({
        where: {
          userId_date: {
            userId,
            date: today,
          },
        },
        update: {
          questionsAsked: { increment: 1 },
          aiCostTotal: { increment: cost },
          ...(model === 'gemini' && { aiQueriesGemini: { increment: 1 } }),
          ...(model === 'huggingface' && { aiQueriesHugging: { increment: 1 } }),
          ...(model === 'ollama' && { aiQueriesLocal: { increment: 1 } }),
        },
        create: {
          userId,
          date: today,
          questionsAsked: 1,
          aiCostTotal: cost,
          aiQueriesGemini: model === 'gemini' ? 1 : 0,
          aiQueriesHugging: model === 'huggingface' ? 1 : 0,
          aiQueriesLocal: model === 'ollama' ? 1 : 0,
        },
      })
    } catch (error) {
      logger.error('Error updating analytics', error)
    }
  }

  /**
   * Get available models status
   */
  async getModelsStatus() {
    return await this.aiRouter.getModelsStatus()
  }
}

