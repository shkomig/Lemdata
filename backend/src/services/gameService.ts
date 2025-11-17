import { GoogleGenerativeAI } from '@google/generative-ai'
import config from '../config/config.js'
import { logger } from '../utils/logger.js'
import {
  GameType,
  DifficultyLevel,
  FillInBlanksContent,
  MatchingContent,
  MultipleChoiceContent,
  WordOrderContent,
  GameContent,
} from '../../../shared/types/index.js'

const genAI = new GoogleGenerativeAI(config.gemini.apiKey)

interface GameGenerationOptions {
  sourceText: string
  gameType?: GameType
  difficulty?: DifficultyLevel
  language?: 'he' | 'en' | 'mixed'
}

interface GameGenerationResult {
  title: string
  description: string
  type: GameType
  difficulty: DifficultyLevel
  content: GameContent
  cost: number
}

/**
 * Game Service - שירות ליצירת משחקים אינטרקטיביים אוטומטית
 */
class GameService {
  /**
   * יוצר משחק אוטומטית מטקסט
   */
  async generateGame(options: GameGenerationOptions): Promise<GameGenerationResult> {
    const { sourceText, gameType, difficulty = DifficultyLevel.MEDIUM, language = 'he' } = options

    // אם לא צוין סוג משחק, בוחרים אוטומטית לפי התוכן
    const selectedGameType = gameType || this.selectGameType(sourceText)

    logger.info(`Generating ${selectedGameType} game with ${difficulty} difficulty`)

    try {
      let result: GameGenerationResult

      switch (selectedGameType) {
        case GameType.FILL_IN_BLANKS:
          result = await this.generateFillInBlanksGame(sourceText, difficulty, language)
          break
        case GameType.MATCHING:
          result = await this.generateMatchingGame(sourceText, difficulty, language)
          break
        case GameType.MULTIPLE_CHOICE:
          result = await this.generateMultipleChoiceGame(sourceText, difficulty, language)
          break
        case GameType.WORD_ORDER:
          result = await this.generateWordOrderGame(sourceText, difficulty, language)
          break
        default:
          throw new Error(`Unsupported game type: ${selectedGameType}`)
      }

      logger.info(`Successfully generated game: ${result.title}`)
      return result
    } catch (error) {
      logger.error('Error generating game:', error)
      throw error
    }
  }

  /**
   * בוחר סוג משחק אוטומטית לפי התוכן
   */
  private selectGameType(text: string): GameType {
    const lowerText = text.toLowerCase()

    // אם יש הרבה הגדרות או זוגות מושגים - משחק התאמות
    if (
      lowerText.includes('הגדר') ||
      lowerText.includes('מהו') ||
      lowerText.includes('definition') ||
      text.split('\n').filter((line) => line.includes(':')).length > 3
    ) {
      return GameType.MATCHING
    }

    // אם יש משפטים ארוכים - משחק השלמת משפטים
    if (text.split('.').length > 5) {
      return GameType.FILL_IN_BLANKS
    }

    // ברירת מחדל - שאלות בחירה מרובה
    return GameType.MULTIPLE_CHOICE
  }

  /**
   * יוצר משחק השלמת משפטים
   */
  private async generateFillInBlanksGame(
    sourceText: string,
    difficulty: DifficultyLevel,
    language: 'he' | 'en' | 'mixed'
  ): Promise<GameGenerationResult> {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `
אתה מחולל משחקים חינוכיים. צור משחק "השלמת משפטים" מהטקסט הבא.

הטקסט:
${sourceText}

דרישות:
- רמת קושי: ${difficulty}
- שפה: ${language === 'he' ? 'עברית' : language === 'en' ? 'אנגלית' : 'מעורבת'}
- צור 5-8 משפטים עם מילה חסרה
- לכל משפט, תן 4 אופציות (כולל התשובה הנכונה)
- המילה החסרה צריכה להיות מילת מפתח חשובה
- במשפט, סמן את המקום החסר ב-"____"

החזר JSON בפורמט הבא:
{
  "title": "כותרת המשחק",
  "description": "תיאור קצר",
  "sentences": [
    {
      "text": "המשפט עם ____ במקום החסר",
      "answer": "התשובה הנכונה",
      "options": ["אופציה 1", "אופציה 2", "אופציה 3", "אופציה 4"]
    }
  ]
}

החזר רק JSON, ללא טקסט נוסף.
`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    // נסה לחלץ JSON מהתשובה
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response as JSON')
    }

    const parsed = JSON.parse(jsonMatch[0])

    // חישוב עלות (אומדן)
    const cost = this.estimateCost(prompt, response)

    return {
      title: parsed.title,
      description: parsed.description,
      type: GameType.FILL_IN_BLANKS,
      difficulty,
      content: {
        sentences: parsed.sentences,
      } as FillInBlanksContent,
      cost,
    }
  }

  /**
   * יוצר משחק התאמות
   */
  private async generateMatchingGame(
    sourceText: string,
    difficulty: DifficultyLevel,
    language: 'he' | 'en' | 'mixed'
  ): Promise<GameGenerationResult> {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `
אתה מחולל משחקים חינוכיים. צור משחק "התאמות" מהטקסט הבא.

הטקסט:
${sourceText}

דרישות:
- רמת קושי: ${difficulty}
- שפה: ${language === 'he' ? 'עברית' : language === 'en' ? 'אנגלית' : 'מעורבת'}
- צור 6-10 זוגות להתאמה
- כל זוג צריך להיות קשור לתוכן
- יכול להיות: מושג-הגדרה, שאלה-תשובה, סיבה-תוצאה, וכו'

החזר JSON בפורמט הבא:
{
  "title": "כותרת המשחק",
  "description": "תיאור קצר",
  "pairs": [
    {
      "id": "1",
      "left": "פריט משמאל",
      "right": "פריט מימין"
    }
  ]
}

החזר רק JSON, ללא טקסט נוסף.
`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response as JSON')
    }

    const parsed = JSON.parse(jsonMatch[0])
    const cost = this.estimateCost(prompt, response)

    return {
      title: parsed.title,
      description: parsed.description,
      type: GameType.MATCHING,
      difficulty,
      content: {
        pairs: parsed.pairs,
      } as MatchingContent,
      cost,
    }
  }

  /**
   * יוצר משחק שאלות ותשובות (בחירה מרובה)
   */
  private async generateMultipleChoiceGame(
    sourceText: string,
    difficulty: DifficultyLevel,
    language: 'he' | 'en' | 'mixed'
  ): Promise<GameGenerationResult> {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `
אתה מחולל משחקים חינוכיים. צור משחק "שאלות ותשובות" (בחירה מרובה) מהטקסט הבא.

הטקסט:
${sourceText}

דרישות:
- רמת קושי: ${difficulty}
- שפה: ${language === 'he' ? 'עברית' : language === 'en' ? 'אנגלית' : 'מעורבת'}
- צור 5-10 שאלות
- לכל שאלה תן 4 אופציות תשובה
- רק תשובה אחת נכונה
- האופציות השגויות צריכות להיות הגיוניות אבל לא נכונות
- אפשר להוסיף הסבר קצר לתשובה הנכונה

החזר JSON בפורמט הבא:
{
  "title": "כותרת המשחק",
  "description": "תיאור קצר",
  "questions": [
    {
      "question": "השאלה",
      "options": ["אופציה 1", "אופציה 2", "אופציה 3", "אופציה 4"],
      "correctAnswer": 0,
      "explanation": "הסבר קצר למה זו התשובה הנכונה"
    }
  ]
}

correctAnswer הוא אינדקס (0-3) של התשובה הנכונה ב-options.
החזר רק JSON, ללא טקסט נוסף.
`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response as JSON')
    }

    const parsed = JSON.parse(jsonMatch[0])
    const cost = this.estimateCost(prompt, response)

    return {
      title: parsed.title,
      description: parsed.description,
      type: GameType.MULTIPLE_CHOICE,
      difficulty,
      content: {
        questions: parsed.questions,
      } as MultipleChoiceContent,
      cost,
    }
  }

  /**
   * יוצר משחק סידור מילים
   */
  private async generateWordOrderGame(
    sourceText: string,
    difficulty: DifficultyLevel,
    language: 'he' | 'en' | 'mixed'
  ): Promise<GameGenerationResult> {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `
אתה מחולל משחקים חינוכיים. צור משחק "סידור מילים" מהטקסט הבא.

הטקסט:
${sourceText}

דרישות:
- רמת קושי: ${difficulty}
- שפה: ${language === 'he' ? 'עברית' : language === 'en' ? 'אנגלית' : 'מעורבת'}
- צור 5-8 משפטים
- לכל משפט, תן את המילים בסדר הנכון (כמערך)
- המשתמש יצטרך לסדר את המילים בסדר הנכון
- אפשר להוסיף רמז קצר

החזר JSON בפורמט הבא:
{
  "title": "כותרת המשחק",
  "description": "תיאור קצר",
  "sentences": [
    {
      "correctOrder": ["מילה1", "מילה2", "מילה3", "מילה4"],
      "hint": "רמז קצר (אופציונלי)"
    }
  ]
}

החזר רק JSON, ללא טקסט נוסף.
`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response as JSON')
    }

    const parsed = JSON.parse(jsonMatch[0])
    const cost = this.estimateCost(prompt, response)

    return {
      title: parsed.title,
      description: parsed.description,
      type: GameType.WORD_ORDER,
      difficulty,
      content: {
        sentences: parsed.sentences,
      } as WordOrderContent,
      cost,
    }
  }

  /**
   * מחשב עלות משוערת של קריאת API
   */
  private estimateCost(prompt: string, response: string): number {
    const totalChars = prompt.length + response.length
    // Gemini Pro: $0.00025 per 1K characters (input) + $0.0005 per 1K characters (output)
    const inputCost = (prompt.length / 1000) * 0.00025
    const outputCost = (response.length / 1000) * 0.0005
    return inputCost + outputCost
  }

  /**
   * מעריך תשובות משחק ומחזיר ציון
   */
  evaluateGameAnswers(game: any, answers: any): {
    score: number
    maxScore: number
    correct: number
    incorrect: number
    percentage: number
    details: any[]
  } {
    const gameType = game.type as GameType
    const content = game.content

    switch (gameType) {
      case GameType.FILL_IN_BLANKS:
        return this.evaluateFillInBlanks(content, answers)
      case GameType.MATCHING:
        return this.evaluateMatching(content, answers)
      case GameType.MULTIPLE_CHOICE:
        return this.evaluateMultipleChoice(content, answers)
      case GameType.WORD_ORDER:
        return this.evaluateWordOrder(content, answers)
      default:
        throw new Error(`Unsupported game type for evaluation: ${gameType}`)
    }
  }

  private evaluateFillInBlanks(content: FillInBlanksContent, answers: string[]) {
    const results = content.sentences.map((sentence, index) => {
      const userAnswer = answers[index]?.trim().toLowerCase()
      const correctAnswer = sentence.answer.trim().toLowerCase()
      const isCorrect = userAnswer === correctAnswer

      return {
        index,
        userAnswer: answers[index],
        correctAnswer: sentence.answer,
        isCorrect,
      }
    })

    const correct = results.filter((r) => r.isCorrect).length
    const total = content.sentences.length

    return {
      score: correct,
      maxScore: total,
      correct,
      incorrect: total - correct,
      percentage: Math.round((correct / total) * 100),
      details: results,
    }
  }

  private evaluateMatching(content: MatchingContent, answers: Record<string, string>) {
    const results = content.pairs.map((pair) => {
      const userAnswer = answers[pair.id]
      const correctAnswer = pair.right
      const isCorrect = userAnswer === correctAnswer

      return {
        id: pair.id,
        left: pair.left,
        userAnswer,
        correctAnswer,
        isCorrect,
      }
    })

    const correct = results.filter((r) => r.isCorrect).length
    const total = content.pairs.length

    return {
      score: correct,
      maxScore: total,
      correct,
      incorrect: total - correct,
      percentage: Math.round((correct / total) * 100),
      details: results,
    }
  }

  private evaluateMultipleChoice(content: MultipleChoiceContent, answers: number[]) {
    const results = content.questions.map((question, index) => {
      const userAnswer = answers[index]
      const correctAnswer = question.correctAnswer
      const isCorrect = userAnswer === correctAnswer

      return {
        index,
        question: question.question,
        userAnswer: question.options[userAnswer],
        correctAnswer: question.options[correctAnswer],
        isCorrect,
        explanation: question.explanation,
      }
    })

    const correct = results.filter((r) => r.isCorrect).length
    const total = content.questions.length

    return {
      score: correct,
      maxScore: total,
      correct,
      incorrect: total - correct,
      percentage: Math.round((correct / total) * 100),
      details: results,
    }
  }

  private evaluateWordOrder(content: WordOrderContent, answers: string[][]) {
    const results = content.sentences.map((sentence, index) => {
      const userAnswer = answers[index] || []
      const correctAnswer = sentence.correctOrder
      const isCorrect =
        JSON.stringify(userAnswer.map((w) => w.trim())) ===
        JSON.stringify(correctAnswer.map((w) => w.trim()))

      return {
        index,
        userAnswer,
        correctAnswer,
        isCorrect,
        hint: sentence.hint,
      }
    })

    const correct = results.filter((r) => r.isCorrect).length
    const total = content.sentences.length

    return {
      score: correct,
      maxScore: total,
      correct,
      incorrect: total - correct,
      percentage: Math.round((correct / total) * 100),
      details: results,
    }
  }
}

export const gameService = new GameService()
