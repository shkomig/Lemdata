import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Lemdata - מערכת חינוכית חכמה',
  description: 'מערכת חינוכית מתקדמת עם AI היברידי',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <body>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  )
}

