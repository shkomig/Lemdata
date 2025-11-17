import { ChatInterface } from '@/components/chat/ChatInterface'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <div className="bg-white border-b p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              ← חזרה לדאשבורד
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">צ'אט עם AI</h1>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto h-[calc(100vh-80px)]">
        <ChatInterface />
      </div>
    </div>
  )
}




