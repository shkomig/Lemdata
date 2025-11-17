'use client'

import { useState, useEffect } from 'react'
import { FillInBlanksContent } from '../../../../../shared/types'

interface FillInBlanksPlayerProps {
  content: FillInBlanksContent
  onAnswersChange: (answers: string[]) => void
}

export function FillInBlanksPlayer({ content, onAnswersChange }: FillInBlanksPlayerProps) {
  const [answers, setAnswers] = useState<string[]>(
    new Array(content.sentences.length).fill('')
  )

  useEffect(() => {
    // בדיקה אם כל התשובות מלאות
    const allFilled = answers.every((answer) => answer.trim() !== '')
    if (allFilled) {
      onAnswersChange(answers)
    } else {
      onAnswersChange(null as any)
    }
  }, [answers, onAnswersChange])

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers]
    newAnswers[index] = value
    setAnswers(newAnswers)
  }

  return (
    <div className="space-y-6">
      <p className="text-right text-gray-600 mb-4">
        השלם את המילים החסרות במשפטים הבאים:
      </p>

      {content.sentences.map((sentence, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center gap-2 text-right" dir="rtl">
            <span className="font-medium">{index + 1}.</span>
            <div className="flex-1">
              {sentence.text.split('____').map((part, partIndex) => (
                <span key={partIndex}>
                  {part}
                  {partIndex < sentence.text.split('____').length - 1 && (
                    <input
                      type="text"
                      value={answers[index]}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      className="inline-block mx-2 px-3 py-1 border-b-2 border-blue-500 focus:outline-none focus:border-blue-700 min-w-[150px] text-center"
                      placeholder="____"
                      dir="rtl"
                    />
                  )}
                </span>
              ))}
            </div>
          </div>

          {sentence.options && sentence.options.length > 0 && (
            <div className="mr-8 flex gap-2 flex-wrap justify-end">
              {sentence.options.map((option, optionIndex) => (
                <button
                  key={optionIndex}
                  onClick={() => handleAnswerChange(index, option)}
                  className={`px-3 py-1 rounded-lg border transition-colors ${
                    answers[index] === option
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white hover:bg-gray-50 border-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
