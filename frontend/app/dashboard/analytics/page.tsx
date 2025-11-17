import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              ← חזרה לדאשבורד
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">ניתוח התקדמות</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        <AnalyticsDashboard />
      </div>
    </div>
  )
}




