'use client'

import { useState, useEffect } from 'react'
import { WordOrderContent } from '../../../../../shared/types'

interface WordOrderPlayerProps {
  content: WordOrderContent
  onAnswersChange: (answers: string[][]) => void
}

export function WordOrderPlayer({ content, onAnswersChange }: WordOrderPlayerProps) {
  const [answers, setAnswers] = useState<string[][]>(
    content.sentences.map(() => [])
  )
  const [availableWords, setAvailableWords] = useState<string[][]>([])

  useEffect(() => {
    // ערבוב המילים לכל משפט
    const shuffled = content.sentences.map((sentence) =>
      [...sentence.correctOrder].sort(() => Math.random() - 0.5)
    )
    setAvailableWords(shuffled)
  }, [content])

  useEffect(() => {
    // בדיקה אם כל המשפטים הושלמו
    const allComplete = answers.every(
      (answer, index) =>
        answer.length === content.sentences[index].correctOrder.length
    )
    if (allComplete) {
      onAnswersChange(answers)
    } else {
      onAnswersChange(null as any)
    }
  }, [answers, content, onAnswersChange])

  const handleWordClick = (sentenceIndex: number, word: string) => {
    // הוספת מילה למשפט
    const newAnswers = [...answers]
    newAnswers[sentenceIndex] = [...newAnswers[sentenceIndex], word]
    setAnswers(newAnswers)

    // הסרת המילה מהזמינות
    const newAvailable = [...availableWords]
    const wordIndex = newAvailable[sentenceIndex].indexOf(word)
    if (wordIndex > -1) {
      newAvailable[sentenceIndex].splice(wordIndex, 1)
      setAvailableWords(newAvailable)
    }
  }

  const handleRemoveWord = (sentenceIndex: number, wordIndex: number) => {
    const word = answers[sentenceIndex][wordIndex]

    // הסרת המילה מהמשפט
    const newAnswers = [...answers]
    newAnswers[sentenceIndex].splice(wordIndex, 1)
    setAnswers(newAnswers)

    // החזרת המילה לזמינות
    const newAvailable = [...availableWords]
    newAvailable[sentenceIndex] = [...newAvailable[sentenceIndex], word]
    setAvailableWords(newAvailable)
  }

  const handleReset = (sentenceIndex: number) => {
    const newAnswers = [...answers]
    const newAvailable = [...availableWords]

    // החזרת כל המילים
    newAvailable[sentenceIndex] = [
      ...newAvailable[sentenceIndex],
      ...newAnswers[sentenceIndex],
    ]
    newAnswers[sentenceIndex] = []

    setAnswers(newAnswers)
    setAvailableWords(newAvailable)
  }

  return (
    <div className="space-y-6">
      <p className="text-right text-gray-600 mb-4">
        סדר את המילים בסדר הנכון:
      </p>

      {content.sentences.map((sentence, sentenceIndex) => (
        <div key={sentenceIndex} className="p-4 bg-gray-50 rounded-lg">
          <div className="mb-3 text-right">
            <span className="font-bold">משפט {sentenceIndex + 1}</span>
            {sentence.hint && (
              <span className="text-sm text-gray-600 mr-2">
                (רמז: {sentence.hint})
              </span>
            )}
          </div>

          {/* המשפט המסודר */}
          <div className="mb-4 p-4 bg-white rounded-lg min-h-[60px] border-2 border-dashed border-gray-300">
            {answers[sentenceIndex].length === 0 ? (
              <p className="text-gray-400 text-center" dir="rtl">
                לחץ על המילים למטה כדי לבנות את המשפט
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 justify-end" dir="rtl">
                {answers[sentenceIndex].map((word, wordIndex) => (
                  <button
                    key={wordIndex}
                    onClick={() => handleRemoveWord(sentenceIndex, wordIndex)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {word}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* מילים זמינות */}
          <div className="flex flex-wrap gap-2 justify-end" dir="rtl">
            {availableWords[sentenceIndex]?.map((word, wordIndex) => (
              <button
                key={wordIndex}
                onClick={() => handleWordClick(sentenceIndex, word)}
                className="px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {word}
              </button>
            ))}
          </div>

          {/* כפתור איפוס */}
          {answers[sentenceIndex].length > 0 && (
            <button
              onClick={() => handleReset(sentenceIndex)}
              className="mt-2 text-sm text-red-600 hover:text-red-700"
            >
              אפס משפט
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
