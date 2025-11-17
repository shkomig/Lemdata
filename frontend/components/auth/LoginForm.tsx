'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'

export const LoginForm = () => {
  const router = useRouter()
  const { login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(email, password)
      toast.success('התחברת בהצלחה!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'שגיאה בהתחברות')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">ברוכים הבאים!</h1>
        <p className="text-gray-600">התחברו למערכת Lemdata</p>
      </div>

      <Input
        type="email"
        label="אימייל"
        placeholder="הכניסו את האימייל שלכם"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={isLoading}
      />

      <Input
        type="password"
        label="סיסמה"
        placeholder="הכניסו את הסיסמה שלכם"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={isLoading}
      />

      <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
        התחברות
      </Button>

      <div className="text-center">
        <p className="text-gray-600">
          אין לכם חשבון?{' '}
          <a href="/register" className="text-primary-600 hover:underline font-bold">
            הירשמו כאן
          </a>
        </p>
      </div>
    </form>
  )
}




