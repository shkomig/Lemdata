'use client'

import { useState, useEffect } from 'react'
import { MatchingContent } from '../../../../../shared/types'

interface MatchingPlayerProps {
  content: MatchingContent
  onAnswersChange: (answers: Record<string, string>) => void
}

export function MatchingPlayer({ content, onAnswersChange }: MatchingPlayerProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [shuffledRights, setShuffledRights] = useState<Array<{ id: string; text: string }>>([])

  useEffect(() => {
    // ערבוב הפריטים מימין
    const rights = content.pairs.map((pair) => ({
      id: pair.id,
      text: pair.right,
    }))
    setShuffledRights(rights.sort(() => Math.random() - 0.5))
  }, [content])

  useEffect(() => {
    // בדיקה אם כל ההתאמות הושלמו
    const allMatched = content.pairs.every((pair) => answers[pair.id])
    if (allMatched) {
      onAnswersChange(answers)
    } else {
      onAnswersChange(null as any)
    }
  }, [answers, content, onAnswersChange])

  const handleLeftClick = (pairId: string) => {
    setSelectedLeft(pairId)
  }

  const handleRightClick = (text: string) => {
    if (!selectedLeft) return

    const newAnswers = { ...answers }
    newAnswers[selectedLeft] = text
    setAnswers(newAnswers)
    setSelectedLeft(null)
  }

  const handleRemoveMatch = (pairId: string) => {
    const newAnswers = { ...answers }
    delete newAnswers[pairId]
    setAnswers(newAnswers)
  }

  const usedRights = new Set(Object.values(answers))

  return (
    <div className="space-y-4">
      <p className="text-right text-gray-600 mb-4">
        התאם בין הפריטים משמאל לפריטים מימין:
      </p>

      <div className="grid grid-cols-2 gap-8" dir="rtl">
        {/* עמודה ימנית */}
        <div className="space-y-2">
          <h3 className="font-bold text-center mb-3">משמאל</h3>
          {content.pairs.map((pair) => {
            const isSelected = selectedLeft === pair.id
            const hasMatch = !!answers[pair.id]

            return (
              <div key={pair.id} className="relative">
                <button
                  onClick={() => handleLeftClick(pair.id)}
                  className={`w-full p-3 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'bg-blue-500 text-white border-blue-500'
                      : hasMatch
                      ? 'bg-green-50 border-green-500'
                      : 'bg-white border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {pair.left}
                </button>

                {hasMatch && (
                  <div className="mt-2 p-2 bg-green-100 rounded-lg relative">
                    <div className="text-sm text-green-700 text-center">
                      ← {answers[pair.id]}
                    </div>
                    <button
                      onClick={() => handleRemoveMatch(pair.id)}
                      className="absolute top-1 left-1 text-red-500 hover:text-red-700 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* עמודה שמאלית */}
        <div className="space-y-2">
          <h3 className="font-bold text-center mb-3">מימין</h3>
          {shuffledRights.map((right) => {
            const isUsed = usedRights.has(right.text)

            return (
              <button
                key={right.id}
                onClick={() => !isUsed && handleRightClick(right.text)}
                disabled={isUsed}
                className={`w-full p-3 rounded-lg border-2 transition-all ${
                  isUsed
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    : selectedLeft
                    ? 'bg-white border-blue-400 hover:bg-blue-50'
                    : 'bg-white border-gray-300 hover:border-gray-400'
                }`}
              >
                {right.text}
              </button>
            )
          })}
        </div>
      </div>

      {selectedLeft && (
        <p className="text-center text-blue-600 font-medium">
          כעת בחר פריט מימין להתאמה
        </p>
      )}
    </div>
  )
}
