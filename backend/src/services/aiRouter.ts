import { db } from './database'
import { logger } from '../utils/logger'

export type AIModel = 'gemini' | 'huggingface' | 'ollama'

export interface ModelSelectionContext {
  userId: string
  message: string
  preferredModel?: 'auto' | AIModel
  costThreshold?: number // Daily cost threshold in USD
}

export interface ModelStatus {
  available: boolean
  cost: 'free' | 'low' | 'medium' | 'high'
  latency: number
  description: string
}

export class AIRouter {
  private readonly DAILY_COST_THRESHOLD = 0.10 // $0.10 per day per user
  private readonly FREE_QUERIES_PER_DAY = 50 // Free queries before switching to local

  /**
   * Select the optimal AI model based on cost, availability, and message type
   */
  async selectOptimalModel(context: ModelSelectionContext): Promise<AIModel> {
    const { userId, message, preferredModel, costThreshold = this.DAILY_COST_THRESHOLD } = context

    // If user specified a model, use it (unless unavailable)
    if (preferredModel && preferredModel !== 'auto') {
      const isAvailable = await this.checkModelAvailability(preferredModel)
      if (isAvailable) {
        return preferredModel
      }
    }

    // Check user's daily costs
    const dailyCost = await this.getUserDailyCost(userId)
    const dailyQueries = await this.getUserDailyQueries(userId)

    // If cost exceeded threshold, use free local model
    if (dailyCost >= costThreshold) {
      logger.info(`User ${userId} exceeded cost threshold, using local model`)
      return 'ollama'
    }

    // If exceeded free queries, prefer local model
    if (dailyQueries >= this.FREE_QUERIES_PER_DAY) {
      const isLocalAvailable = await this.checkModelAvailability('ollama')
      if (isLocalAvailable) {
        logger.info(`User ${userId} exceeded free queries, using local model`)
        return 'ollama'
      }
    }

    // Analyze message complexity
    const messageAnalysis = this.analyzeMessage(message)

    // For complex Hebrew queries, prefer Gemini
    if (messageAnalysis.isHebrew && messageAnalysis.isComplex) {
      const isGeminiAvailable = await this.checkModelAvailability('gemini')
      if (isGeminiAvailable) {
        return 'gemini'
      }
    }

    // For simple queries, use free options first
    if (messageAnalysis.isSimple) {
      // Try Hugging Face first (completely free)
      const isHuggingAvailable = await this.checkModelAvailability('huggingface')
      if (isHuggingAvailable) {
        return 'huggingface'
      }

      // Fallback to Gemini (has free tier)
      const isGeminiAvailable = await this.checkModelAvailability('gemini')
      if (isGeminiAvailable) {
        return 'gemini'
      }
    }

    // Default fallback order
    const fallbackOrder: AIModel[] = ['gemini', 'huggingface', 'ollama']
    for (const model of fallbackOrder) {
      const isAvailable = await this.checkModelAvailability(model)
      if (isAvailable) {
        return model
      }
    }

    // Last resort: return gemini even if not checked (will handle error in service)
    return 'gemini'
  }

  /**
   * Get user's daily AI costs
   */
  private async getUserDailyCost(userId: string): Promise<number> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const prisma = db.getPrisma()
      const analytics = await prisma.userAnalytics.findFirst({
        where: {
          userId,
          date: {
            gte: today,
          },
        },
      })

      return analytics?.aiCostTotal || 0
    } catch (error) {
      logger.error('Error fetching user daily cost', error)
      return 0
    }
  }

  /**
   * Get user's daily query count
   */
  private async getUserDailyQueries(userId: string): Promise<number> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const prisma = db.getPrisma()
      const analytics = await prisma.userAnalytics.findFirst({
        where: {
          userId,
          date: {
            gte: today,
          },
        },
      })

      return analytics?.questionsAsked || 0
    } catch (error) {
      logger.error('Error fetching user daily queries', error)
      return 0
    }
  }

  /**
   * Check if a model is available
   */
  private async checkModelAvailability(model: AIModel): Promise<boolean> {
    switch (model) {
      case 'gemini':
        // Check if API key is configured
        return !!process.env.GEMINI_API_KEY

      case 'huggingface':
        // Check if API key is configured (optional for some models)
        return true // Hugging Face has public models

      case 'ollama':
        // Check if Ollama service is running
        try {
          const response = await fetch(`${process.env.OLLAMA_HOST || 'http://localhost:11434'}/api/tags`, {
            signal: AbortSignal.timeout(2000), // 2 second timeout
          })
          return response.ok
        } catch {
          return false
        }

      default:
        return false
    }
  }

  /**
   * Analyze message to determine complexity
   */
  private analyzeMessage(message: string): {
    isHebrew: boolean
    isComplex: boolean
    isSimple: boolean
    hasMath: boolean
    hasCode: boolean
  } {
    const hebrewRegex = /[\u0590-\u05FF]/
    const isHebrew = hebrewRegex.test(message)

    // Complex indicators
    const complexKeywords = [
      'מתמטיקה', 'מתמטי', 'אלגברה', 'גיאומטריה', 'חשבון דיפרנציאלי',
      'פיזיקה', 'פיזיקלי', 'כימיה', 'ביולוגיה',
      'calculus', 'derivative', 'integral', 'quantum', 'relativity',
      'תוכנה', 'קוד', 'programming', 'code', 'algorithm',
    ]

    const hasComplexKeywords = complexKeywords.some((keyword) =>
      message.toLowerCase().includes(keyword.toLowerCase())
    )

    const isLong = message.length > 200
    const isComplex = hasComplexKeywords || isLong

    // Simple indicators
    const isShort = message.length < 50
    const isSimple = isShort && !hasComplexKeywords

    // Math indicators
    const mathRegex = /[\+\-\*\/=<>≤≥∫∑√]/g
    const hasMath = mathRegex.test(message)

    // Code indicators
    const codeRegex = /(function|const|let|var|if|for|while|class|import|from)/gi
    const hasCode = codeRegex.test(message)

    return {
      isHebrew,
      isComplex,
      isSimple,
      hasMath,
      hasCode,
    }
  }

  /**
   * Get status of all available models
   */
  async getModelsStatus(): Promise<Record<AIModel, ModelStatus>> {
    const [geminiAvailable, huggingAvailable, ollamaAvailable] = await Promise.all([
      this.checkModelAvailability('gemini'),
      this.checkModelAvailability('huggingface'),
      this.checkModelAvailability('ollama'),
    ])

    return {
      gemini: {
        available: geminiAvailable,
        cost: 'low',
        latency: 500, // ms
        description: 'Google Gemini - תמיכה מעולה בעברית, חינמי עד 60 בקשות/דקה',
      },
      huggingface: {
        available: huggingAvailable,
        cost: 'free',
        latency: 1000, // ms
        description: 'Hugging Face - מודלים אופ-סורס, חינמי לחלוטין',
      },
      ollama: {
        available: ollamaAvailable,
        cost: 'free',
        latency: 2000, // ms (local processing)
        description: 'Ollama - מודל מקומי, חינמי לחלוטין, דורש התקנה מקומית',
      },
    }
  }

  /**
   * Calculate estimated cost for a model based on message length
   */
  estimateCost(model: AIModel, messageLength: number, responseLength?: number): number {
    // Rough token estimation (1 token ≈ 4 characters)
    const inputTokens = Math.ceil(messageLength / 4)
    const outputTokens = responseLength ? Math.ceil(responseLength / 4) : inputTokens * 0.5
    const totalTokens = inputTokens + outputTokens

    switch (model) {
      case 'gemini':
        // Gemini free tier: first 15 RPM free, then $0.00025 per 1K characters
        // For simplicity, assume we're in free tier for small requests
        if (totalTokens < 1000) return 0
        return (totalTokens / 1000) * 0.00025

      case 'huggingface':
        // Free
        return 0

      case 'ollama':
        // Free (local)
        return 0

      default:
        return 0
    }
  }
}




