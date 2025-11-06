'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, checkAuth, logout } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">טוען...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const dashboardCards = [
    {
      title: '💬 צ\'אט עם AI',
      description: 'שאל שאלות וקבל תשובות חכמות',
      href: '/dashboard/chat',
      color: 'bg-blue-500',
      icon: '💬',
    },
    {
      title: '📸 העלאת תמונות',
      description: 'העלה תמונות לניתוח וזיהוי',
      href: '/dashboard/images',
      color: 'bg-green-500',
      icon: '📸',
    },
    {
      title: '📊 התקדמות',
      description: 'צפה בהתקדמות שלך',
      href: '/dashboard/analytics',
      color: 'bg-purple-500',
      icon: '📊',
    },
    {
      title: '📚 תוכן לימודי',
      description: 'גישה לתכנים ומשאבים',
      href: '/dashboard/content',
      color: 'bg-orange-500',
      icon: '📚',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">שלום, {user.name}!</h1>
              <p className="text-gray-600 mt-1">ברוכים הבאים ל-Lemdata</p>
            </div>
            <Button variant="outline" onClick={logout}>
              התנתק
            </Button>
          </div>
        </header>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardCards.map((card) => (
            <Link key={card.href} href={card.href}>
              <Card hover className="text-center h-full">
                <div className={`${card.color} rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center text-4xl`}>
                  {card.icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{card.title}</h2>
                <p className="text-gray-600">{card.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

