'use client'

import { useState, useEffect } from 'react'
import { MultipleChoiceContent } from '../../../../../shared/types'

interface MultipleChoicePlayerProps {
  content: MultipleChoiceContent
  onAnswersChange: (answers: number[]) => void
}

export function MultipleChoicePlayer({ content, onAnswersChange }: MultipleChoicePlayerProps) {
  const [answers, setAnswers] = useState<number[]>(
    new Array(content.questions.length).fill(-1)
  )

  useEffect(() => {
    // בדיקה אם כל השאלות נענו
    const allAnswered = answers.every((answer) => answer !== -1)
    if (allAnswered) {
      onAnswersChange(answers)
    } else {
      onAnswersChange(null as any)
    }
  }, [answers, onAnswersChange])

  const handleAnswerChange = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[questionIndex] = optionIndex
    setAnswers(newAnswers)
  }

  return (
    <div className="space-y-6">
      <p className="text-right text-gray-600 mb-4">
        ענה על השאלות הבאות:
      </p>

      {content.questions.map((question, questionIndex) => (
        <div key={questionIndex} className="p-4 bg-gray-50 rounded-lg">
          <div className="mb-3 text-right">
            <span className="font-bold text-lg">שאלה {questionIndex + 1}:</span>{' '}
            <span>{question.question}</span>
          </div>

          <div className="space-y-2">
            {question.options.map((option, optionIndex) => {
              const isSelected = answers[questionIndex] === optionIndex
              const letter = String.fromCharCode(1488 + optionIndex) // א, ב, ג, ד

              return (
                <button
                  key={optionIndex}
                  onClick={() => handleAnswerChange(questionIndex, optionIndex)}
                  className={`w-full p-3 rounded-lg border-2 text-right transition-all ${
                    isSelected
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                  dir="rtl"
                >
                  <span className="font-bold ml-2">{letter}.</span>
                  {option}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
