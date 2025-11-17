'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { gameAPI } from '@/lib/api'
import { GameGenerator } from '@/components/games/GameGenerator'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { GameType, DifficultyLevel, Game } from '../../../../shared/types'

export default function GamesPage() {
  const router = useRouter()
  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showGenerator, setShowGenerator] = useState(false)

  useEffect(() => {
    loadGames()
  }, [])

  const loadGames = async () => {
    try {
      const response = await gameAPI.getGames()
      setGames(response.games || [])
    } catch (error) {
      console.error('Error loading games:', error)
      toast.error('שגיאה בטעינת המשחקים')
    } finally {
      setLoading(false)
    }
  }

  const handleGameCreated = (game: Game) => {
    setShowGenerator(false)
    loadGames()
    router.push(`/dashboard/games/${game.id}`)
  }

  const handleDeleteGame = async (gameId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק משחק זה?')) {
      return
    }

    try {
      await gameAPI.deleteGame(gameId)
      toast.success('המשחק נמחק בהצלחה')
      loadGames()
    } catch (error) {
      console.error('Error deleting game:', error)
      toast.error('שגיאה במחיקת המשחק')
    }
  }

  const getGameTypeLabel = (type: GameType) => {
    switch (type) {
      case GameType.FILL_IN_BLANKS:
        return 'השלמת משפטים'
      case GameType.MATCHING:
        return 'התאמות'
      case GameType.MULTIPLE_CHOICE:
        return 'בחירה מרובה'
      case GameType.WORD_ORDER:
        return 'סידור מילים'
      default:
        return type
    }
  }

  const getDifficultyLabel = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case DifficultyLevel.EASY:
        return 'קל'
      case DifficultyLevel.MEDIUM:
        return 'בינוני'
      case DifficultyLevel.HARD:
        return 'קשה'
      default:
        return difficulty
    }
  }

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case DifficultyLevel.EASY:
        return 'bg-green-100 text-green-700'
      case DifficultyLevel.MEDIUM:
        return 'bg-yellow-100 text-yellow-700'
      case DifficultyLevel.HARD:
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">טוען משחקים...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">משחקים אינטרקטיביים</h1>
        <p className="text-gray-600">
          צור משחקים חינוכיים אוטומטית מתמונות או טקסט
        </p>
      </div>

      {/* כפתור יצירת משחק חדש */}
      <div className="mb-6">
        <Button
          onClick={() => setShowGenerator(!showGenerator)}
          className="w-full sm:w-auto"
        >
          {showGenerator ? 'סגור' : 'צור משחק חדש'}
        </Button>
      </div>

      {/* מחולל משחקים */}
      {showGenerator && (
        <div className="mb-8">
          <GameGenerator onGameCreated={handleGameCreated} />
        </div>
      )}

      {/* רשימת משחקים */}
      {games.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="text-2xl font-bold mb-2">אין משחקים עדיין</h3>
          <p className="text-gray-600 mb-4">
            צור את המשחק הראשון שלך על ידי העלאת תמונה של דף עבודה
          </p>
          <Button onClick={() => setShowGenerator(true)}>
            צור משחק חדש
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <Card key={game.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <h3 className="text-xl font-bold mb-2 text-right">
                  {game.title}
                </h3>
                {game.description && (
                  <p className="text-gray-600 text-sm text-right">
                    {game.description}
                  </p>
                )}
              </div>

              <div className="flex gap-2 mb-4 justify-end flex-wrap">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {getGameTypeLabel(game.type)}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(
                    game.difficulty
                  )}`}
                >
                  {getDifficultyLabel(game.difficulty)}
                </span>
              </div>

              {game.image && (
                <div className="mb-4 text-sm text-gray-600 text-right">
                  📷 נוצר מתמונה: {game.image.originalName}
                </div>
              )}

              {game.sessionsCount > 0 && (
                <div className="mb-4 text-sm text-gray-600 text-right">
                  🎯 שוחק {game.sessionsCount} פעמים
                </div>
              )}

              <div className="text-xs text-gray-500 mb-4 text-right">
                נוצר: {new Date(game.createdAt).toLocaleDateString('he-IL')}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => router.push(`/dashboard/games/${game.id}`)}
                  className="flex-1"
                >
                  שחק
                </Button>
                <button
                  onClick={() => handleDeleteGame(game.id)}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="מחק משחק"
                >
                  🗑️
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
