import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function ContentPage() {
  const resources = [
    {
      title: 'מאגרי תוכן של משרד החינוך',
      description: 'גישה למאגרי תוכן רשמיים',
      link: 'https://pop.education.gov.il/',
      icon: '📚',
    },
    {
      title: 'Khan Academy',
      description: 'שיעורים ותרגילים במגוון נושאים',
      link: 'https://www.khanacademy.org/',
      icon: '🎓',
    },
    {
      title: 'Coursera for Campus',
      description: 'קורסים מקצועיים אונליין',
      link: 'https://www.coursera.org/campus',
      icon: '💻',
    },
    {
      title: 'Google for Education',
      description: 'כלים חינוכיים מתקדמים',
      link: 'https://edu.google.com/',
      icon: '🔍',
    },
  ]

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
          <h1 className="text-2xl font-bold">תוכן לימודי</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">משאבים חינוכיים</h2>
          <p className="text-gray-600">גש למגוון משאבים חינוכיים מתקדמים</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resources.map((resource, index) => (
            <Card key={index} hover>
              <div className="flex items-start gap-4">
                <div className="text-5xl">{resource.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{resource.title}</h3>
                  <p className="text-gray-600 mb-4">{resource.description}</p>
                  <a
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <Button variant="outline" size="sm">
                      פתח →
                    </Button>
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}




