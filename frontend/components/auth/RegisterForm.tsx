'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'

export const RegisterForm = () => {
  const router = useRouter()
  const { register } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await register(email, password, name)
      toast.success('נרשמת בהצלחה!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'שגיאה ברישום')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">הצטרפו אלינו!</h1>
        <p className="text-gray-600">צרו חשבון חדש במערכת Lemdata</p>
      </div>

      <Input
        type="text"
        label="שם מלא"
        placeholder="הכניסו את השם המלא שלכם"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        disabled={isLoading}
      />

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
        placeholder="הכניסו סיסמה (לפחות 6 תווים)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
        disabled={isLoading}
      />

      <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
        הרשמה
      </Button>

      <div className="text-center">
        <p className="text-gray-600">
          כבר יש לכם חשבון?{' '}
          <a href="/login" className="text-primary-600 hover:underline font-bold">
            התחברו כאן
          </a>
        </p>
      </div>
    </form>
  )
}




