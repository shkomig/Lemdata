'use client'

import { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import api from '@/lib/api'

interface Analytics {
  today: {
    questionsAsked: number
    aiCostTotal: number
    imagesUploaded: number
    aiQueriesGemini: number
    aiQueriesHugging: number
    aiQueriesLocal: number
  }
  totals: {
    totalQuestions: number
    totalCost: number
    totalImages: number
    geminiQueries: number
    huggingQueries: number
    localQueries: number
  }
  history: Array<{
    date: string
    questionsAsked: number
    aiCostTotal: number
  }>
}

export const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await api.get<Analytics>('/api/analytics')
      setAnalytics(response.data)
    } catch (error) {
      console.error('Error fetching analytics', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-2xl">טוען נתונים...</div>
      </div>
    )
  }

  if (!analytics) {
    return <div className="text-center py-12">לא נמצאו נתונים</div>
  }

  const statsCards = [
    {
      title: 'שאלות היום',
      value: analytics.today.questionsAsked,
      icon: '❓',
      color: 'bg-blue-500',
    },
    {
      title: 'עלות היום',
      value: `$${analytics.today.aiCostTotal.toFixed(4)}`,
      icon: '💰',
      color: 'bg-green-500',
    },
    {
      title: 'תמונות שהועלו',
      value: analytics.today.imagesUploaded,
      icon: '📸',
      color: 'bg-purple-500',
    },
    {
      title: 'סה"כ שאלות',
      value: analytics.totals.totalQuestions,
      icon: '📊',
      color: 'bg-orange-500',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Today's Stats */}
      <div>
        <h2 className="text-2xl font-bold mb-4">סטטיסטיקות היום</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <Card key={index}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`${stat.color} rounded-full w-16 h-16 flex items-center justify-center text-4xl`}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Model Usage */}
      <div>
        <h2 className="text-2xl font-bold mb-4">שימוש במודלים</h2>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Gemini</p>
              <p className="text-2xl font-bold text-blue-600">{analytics.totals.geminiQueries}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Hugging Face</p>
              <p className="text-2xl font-bold text-purple-600">{analytics.totals.huggingQueries}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Local (Ollama)</p>
              <p className="text-2xl font-bold text-green-600">{analytics.totals.localQueries}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Simple Chart */}
      <div>
        <h2 className="text-2xl font-bold mb-4">התקדמות (30 ימים אחרונים)</h2>
        <Card>
          <div className="space-y-2">
            {analytics.history.slice(-7).map((day, index) => {
              const maxQuestions = Math.max(
                ...analytics.history.map((d) => d.questionsAsked),
                1
              )
              const percentage = (day.questionsAsked / maxQuestions) * 100

              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-gray-600">
                    {new Date(day.date).toLocaleDateString('he-IL', {
                      day: '2-digit',
                      month: '2-digit',
                    })}
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-8 relative">
                      <div
                        className="bg-primary-600 h-8 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${percentage}%` }}
                      >
                        {day.questionsAsked > 0 && (
                          <span className="text-white text-sm font-bold">{day.questionsAsked}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Recommendations */}
      <div>
        <h2 className="text-2xl font-bold mb-4">המלצות</h2>
        <Card>
          <div className="space-y-3">
            {analytics.today.aiCostTotal > 0.05 && (
              <div className="p-3 bg-yellow-50 border-r-4 border-yellow-500 rounded">
                <p className="font-bold text-yellow-800">💡 חיסכון בעלויות</p>
                <p className="text-yellow-700">
                  העלות שלך היום גבוהה. נסה להשתמש במודל המקומי (Ollama) לחיסכון.
                </p>
              </div>
            )}
            {analytics.today.questionsAsked === 0 && (
              <div className="p-3 bg-blue-50 border-r-4 border-blue-500 rounded">
                <p className="font-bold text-blue-800">🚀 התחל להשתמש במערכת</p>
                <p className="text-blue-700">עדיין לא שאלת שאלות היום. נסה את הצ'אט!</p>
              </div>
            )}
            {analytics.totals.totalImages === 0 && (
              <div className="p-3 bg-purple-50 border-r-4 border-purple-500 rounded">
                <p className="font-bold text-purple-800">📸 העלה תמונות</p>
                <p className="text-purple-700">
                  נסה להעלות תמונות של דפי עבודה לניתוח אוטומטי!
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}




