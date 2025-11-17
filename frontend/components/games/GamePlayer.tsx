'use client'

import { useState } from 'react'
import { Game, GameType } from '../../../../shared/types'
import { FillInBlanksPlayer } from './players/FillInBlanksPlayer'
import { MatchingPlayer } from './players/MatchingPlayer'
import { MultipleChoicePlayer } from './players/MultipleChoicePlayer'
import { WordOrderPlayer } from './players/WordOrderPlayer'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { gameAPI } from '@/lib/api'
import toast from 'react-hot-toast'

interface GamePlayerProps {
  game: Game
  onComplete?: (session: any) => void
}

export function GamePlayer({ game, onComplete }: GamePlayerProps) {
  const [answers, setAnswers] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [startTime] = useState(Date.now())

  const handleAnswersChange = (newAnswers: any) => {
    setAnswers(newAnswers)
  }

  const handleSubmit = async () => {
    if (!answers) {
      toast.error('אנא השב על כל השאלות')
      return
    }

    setIsSubmitting(true)
    const timeSpent = Date.now() - startTime

    try {
      const response = await gameAPI.submitAnswers(game.id, {
        answers,
        timeSpent,
      })

      setResult(response)
      toast.success(`כל הכבוד! קיבלת ${response.feedback.percentage}%`)

      if (onComplete) {
        onComplete(response.session)
      }
    } catch (error: any) {
      console.error('Error submitting answers:', error)
      toast.error('שגיאה בשליחת התשובות')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetry = () => {
    setAnswers(null)
    setResult(null)
  }

  if (result) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">תוצאות</h2>

          <div className="text-6xl font-bold text-blue-600">
            {result.feedback.percentage}%
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="p-4 bg-green-100 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {result.feedback.correct}
              </div>
              <div className="text-sm text-green-700">תשובות נכונות</div>
            </div>

            <div className="p-4 bg-red-100 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {result.feedback.incorrect}
              </div>
              <div className="text-sm text-red-700">תשובות שגויות</div>
            </div>
          </div>

          {result.session.timeSpent && (
            <p className="text-gray-600">
              זמן: {Math.round(result.session.timeSpent / 1000)} שניות
            </p>
          )}

          <div className="flex gap-3 justify-center">
            <Button onClick={handleRetry}>נסה שוב</Button>
            <Button
              onClick={() => window.location.href = '/dashboard/games'}
              variant="secondary"
            >
              חזור למשחקים
            </Button>
          </div>

          {/* Details */}
          {result.feedback.details && (
            <div className="mt-6 text-right">
              <h3 className="text-xl font-bold mb-4">פירוט התשובות</h3>
              <div className="space-y-2">
                {result.feedback.details.map((detail: any, index: number) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      detail.isCorrect ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={detail.isCorrect ? 'text-green-600' : 'text-red-600'}>
                        {detail.isCorrect ? '✓' : '✗'}
                      </span>
                      <div className="flex-1 mr-3">
                        {detail.question && (
                          <div className="font-medium">{detail.question}</div>
                        )}
                        <div className="text-sm">
                          <span className="text-gray-600">התשובה שלך: </span>
                          <span>{detail.userAnswer || 'ללא תשובה'}</span>
                        </div>
                        {!detail.isCorrect && (
                          <div className="text-sm text-green-600">
                            <span className="text-gray-600">התשובה הנכונה: </span>
                            <span>{detail.correctAnswer}</span>
                          </div>
                        )}
                        {detail.explanation && (
                          <div className="text-sm text-gray-600 mt-1">
                            💡 {detail.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="mb-6 text-right">
        <h2 className="text-2xl font-bold mb-2">{game.title}</h2>
        {game.description && (
          <p className="text-gray-600">{game.description}</p>
        )}
        <div className="flex gap-2 mt-2 justify-end">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
            {game.type === GameType.FILL_IN_BLANKS && 'השלמת משפטים'}
            {game.type === GameType.MATCHING && 'התאמות'}
            {game.type === GameType.MULTIPLE_CHOICE && 'בחירה מרובה'}
            {game.type === GameType.WORD_ORDER && 'סידור מילים'}
          </span>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
            {game.difficulty === 'EASY' && 'קל'}
            {game.difficulty === 'MEDIUM' && 'בינוני'}
            {game.difficulty === 'HARD' && 'קשה'}
          </span>
        </div>
      </div>

      <div className="mb-6">
        {game.type === GameType.FILL_IN_BLANKS && (
          <FillInBlanksPlayer
            content={game.content as any}
            onAnswersChange={handleAnswersChange}
          />
        )}
        {game.type === GameType.MATCHING && (
          <MatchingPlayer
            content={game.content as any}
            onAnswersChange={handleAnswersChange}
          />
        )}
        {game.type === GameType.MULTIPLE_CHOICE && (
          <MultipleChoicePlayer
            content={game.content as any}
            onAnswersChange={handleAnswersChange}
          />
        )}
        {game.type === GameType.WORD_ORDER && (
          <WordOrderPlayer
            content={game.content as any}
            onAnswersChange={handleAnswersChange}
          />
        )}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!answers || isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'שולח...' : 'שלח תשובות'}
      </Button>
    </Card>
  )
}
