'use client'

import { useState } from 'react'
import { gameAPI } from '@/lib/api'
import { GameType, DifficultyLevel } from '../../../../shared/types'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import toast from 'react-hot-toast'

interface GameGeneratorProps {
  imageId?: string
  onGameCreated?: (game: any) => void
}

export function GameGenerator({ imageId, onGameCreated }: GameGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [gameType, setGameType] = useState<GameType | ''>('')
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DifficultyLevel.MEDIUM)
  const [sourceText, setSourceText] = useState('')
  const [title, setTitle] = useState('')

  const handleGenerate = async () => {
    if (!imageId && !sourceText.trim()) {
      toast.error('אנא הזן טקסט או בחר תמונה')
      return
    }

    if (sourceText.trim() && sourceText.trim().length < 50) {
      toast.error('הטקסט קצר מדי. אנא הזן לפחות 50 תווים')
      return
    }

    setIsGenerating(true)
    const loadingToast = toast.loading('יוצר משחק אינטרקטיבי...')

    try {
      const response = await gameAPI.generateGame({
        imageId,
        sourceText: sourceText.trim() || undefined,
        gameType: gameType || undefined,
        difficulty,
        title: title.trim() || undefined,
      })

      toast.success('המשחק נוצר בהצלחה!', { id: loadingToast })

      // Reset form
      setSourceText('')
      setTitle('')
      setGameType('')

      if (onGameCreated) {
        onGameCreated(response.game)
      }
    } catch (error: any) {
      console.error('Error generating game:', error)
      toast.error(
        error.response?.data?.error || 'שגיאה ביצירת המשחק. אנא נסה שוב.',
        { id: loadingToast }
      )
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-right">יצירת משחק אינטרקטיבי</h2>

      <div className="space-y-4">
        {!imageId && (
          <div>
            <label className="block text-sm font-medium mb-2 text-right">
              טקסט המקור (אופציונלי אם יש תמונה)
            </label>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              className="w-full p-3 border rounded-lg min-h-[150px] text-right"
              placeholder="הזן כאן את הטקסט ממנו ייווצר המשחק..."
              dir="rtl"
              disabled={isGenerating}
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {sourceText.length} תווים (מינימום 50)
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2 text-right">
            כותרת (אופציונלי)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border rounded-lg text-right"
            placeholder="כותרת מותאמת אישית למשחק"
            dir="rtl"
            disabled={isGenerating}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-right">
            סוג משחק
          </label>
          <select
            value={gameType}
            onChange={(e) => setGameType(e.target.value as GameType | '')}
            className="w-full p-3 border rounded-lg text-right"
            dir="rtl"
            disabled={isGenerating}
          >
            <option value="">אוטומטי (המערכת תבחר)</option>
            <option value={GameType.FILL_IN_BLANKS}>השלמת משפטים</option>
            <option value={GameType.MATCHING}>התאמות</option>
            <option value={GameType.MULTIPLE_CHOICE}>בחירה מרובה</option>
            <option value={GameType.WORD_ORDER}>סידור מילים</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-right">
            רמת קושי
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
            className="w-full p-3 border rounded-lg text-right"
            dir="rtl"
            disabled={isGenerating}
          >
            <option value={DifficultyLevel.EASY}>קל</option>
            <option value={DifficultyLevel.MEDIUM}>בינוני</option>
            <option value={DifficultyLevel.HARD}>קשה</option>
          </select>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || (!imageId && !sourceText.trim())}
          className="w-full"
        >
          {isGenerating ? 'יוצר משחק...' : 'צור משחק אינטרקטיבי'}
        </Button>

        {imageId && (
          <p className="text-sm text-gray-600 text-center">
            המשחק ייווצר מהתמונה שהעלית
          </p>
        )}
      </div>
    </Card>
  )
}
