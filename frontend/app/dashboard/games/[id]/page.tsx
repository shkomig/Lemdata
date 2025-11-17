'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { gameAPI } from '@/lib/api'
import { GamePlayer } from '@/components/games/GamePlayer'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { Game } from '../../../../../shared/types'

export default function GamePlayPage() {
  const params = useParams()
  const router = useRouter()
  const gameId = params.id as string

  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<any[]>([])

  useEffect(() => {
    loadGame()
  }, [gameId])

  const loadGame = async () => {
    try {
      const response = await gameAPI.getGame(gameId)
      setGame(response.game)
      setSessions(response.game.gameSessions || [])
    } catch (error: any) {
      console.error('Error loading game:', error)
      toast.error('שגיאה בטעינת המשחק')
      if (error.response?.status === 404) {
        router.push('/dashboard/games')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGameComplete = (session: any) => {
    loadGame() // רענון הנתונים
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">טוען משחק...</p>
        </div>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">המשחק לא נמצא</h2>
          <Button onClick={() => router.push('/dashboard/games')}>
            חזור למשחקים
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-4">
        <Button
          onClick={() => router.push('/dashboard/games')}
          variant="secondary"
        >
          ← חזור למשחקים
        </Button>
      </div>

      <div className="max-w-4xl mx-auto">
        <GamePlayer game={game} onComplete={handleGameComplete} />

        {/* היסטוריית ניסיונות */}
        {sessions.length > 0 && (
          <Card className="mt-8 p-6">
            <h3 className="text-xl font-bold mb-4 text-right">
              ניסיונות קודמים
            </h3>
            <div className="space-y-3">
              {sessions.map((session: any, index: number) => (
                <div
                  key={session.id}
                  className="p-4 bg-gray-50 rounded-lg flex justify-between items-center"
                >
                  <div className="text-right">
                    <div className="font-medium">
                      ניסיון {sessions.length - index}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(session.startedAt).toLocaleString('he-IL')}
                    </div>
                  </div>
                  <div className="text-left">
                    <div
                      className={`text-2xl font-bold ${
                        (session.score / session.maxScore) * 100 >= 80
                          ? 'text-green-600'
                          : (session.score / session.maxScore) * 100 >= 60
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                    >
                      {Math.round((session.score / session.maxScore) * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">
                      {session.score}/{session.maxScore}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
