'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { chatApi, Message } from '@/lib/chat'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'

export const ChatInterface = () => {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId: conversationId || '',
      userId: user?.id || '',
      content: inputMessage,
      role: 'user',
      cost: 0,
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await chatApi.sendMessage({
        message: inputMessage,
        conversationId,
      })

      setConversationId(response.conversationId)

      const assistantMessage: Message = {
        id: `msg-${Date.now()}`,
        conversationId: response.conversationId,
        userId: user?.id || '',
        content: response.text,
        role: 'assistant',
        model: response.model,
        cost: response.cost,
        metadata: response.metadata,
        createdAt: new Date().toISOString(),
      }

      setMessages((prev) => {
        // Remove temp message and add real ones
        const filtered = prev.filter((m) => !m.id.startsWith('temp-'))
        return [...filtered, assistantMessage]
      })
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'שגיאה בשליחת ההודעה')
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b p-4 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">צ'אט עם AI</h2>
        <p className="text-sm text-gray-600">שאל כל שאלה ותקבל תשובה חכמה</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-lg">שלום! איך אני יכול לעזור לך היום?</p>
            <p className="text-sm mt-2">נסה לשאול שאלה או להעלות תמונה</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-900 shadow-md'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                {message.role === 'assistant' && message.model && (
                  <p className="text-xs mt-2 opacity-70">
                    מודל: {message.model} • עלות: ${message.cost.toFixed(4)}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl px-4 py-3 shadow-md">
              <div className="flex space-x-2 space-x-reverse">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t p-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="הקלד הודעה..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleSend} isLoading={isLoading} disabled={!inputMessage.trim()}>
            שלח
          </Button>
        </div>
      </div>
    </div>
  )
}

