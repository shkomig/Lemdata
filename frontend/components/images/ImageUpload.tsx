'use client'

import { useState, useRef, DragEvent } from 'react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface ImageAnalysis {
  ocrText?: string
  language?: string
  confidence?: number
  summary?: string
  topics?: string[]
  difficulty?: string
}

interface UploadedImage {
  id: string
  url: string
  originalName: string
  ocrText?: string
  analysis?: ImageAnalysis
  createdAt: string
}

export const ImageUpload = () => {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find((file) => file.type.startsWith('image/'))

    if (imageFile) {
      handleFileUpload(imageFile)
    } else {
      toast.error('אנא העלה קובץ תמונה')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('אנא העלה קובץ תמונה בלבד')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('הקובץ גדול מדי (מקסימום 10MB)')
      return
    }

    setIsUploading(true)
    setAnalysis(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post<{
        image: UploadedImage
        analysis: ImageAnalysis
      }>('/api/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setUploadedImages((prev) => [response.data.image, ...prev])
      setAnalysis(response.data.analysis)
      toast.success('התמונה הועלתה ונבדקה בהצלחה!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'שגיאה בהעלאת התמונה')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card
        className={`
          border-2 border-dashed p-12 text-center transition-colors
          ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-6xl mb-4">📸</div>
        <h3 className="text-2xl font-bold mb-2">גרור ושחרר תמונה כאן</h3>
        <p className="text-gray-600 mb-4">או לחץ על הכפתור לבחירת קובץ</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
          בחר תמונה
        </Button>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <Card>
          <h3 className="text-xl font-bold mb-4">תוצאות ניתוח:</h3>
          <div className="space-y-3">
            {analysis.ocrText && (
              <div>
                <h4 className="font-bold text-gray-700">טקסט מזוהה:</h4>
                <p className="bg-gray-50 p-3 rounded-lg">{analysis.ocrText}</p>
              </div>
            )}
            {analysis.summary && (
              <div>
                <h4 className="font-bold text-gray-700">סיכום:</h4>
                <p className="bg-gray-50 p-3 rounded-lg">{analysis.summary}</p>
              </div>
            )}
            {analysis.topics && analysis.topics.length > 0 && (
              <div>
                <h4 className="font-bold text-gray-700">נושאים:</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.topics.map((topic, index) => (
                    <span
                      key={index}
                      className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {analysis.difficulty && (
              <div>
                <h4 className="font-bold text-gray-700">רמת קושי:</h4>
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                  {analysis.difficulty}
                </span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4">תמונות שהועלו:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedImages.map((image) => (
              <Card key={image.id}>
                <img
                  src={image.url}
                  alt={image.originalName}
                  className="w-full h-48 object-cover rounded-lg mb-2"
                />
                <p className="text-sm text-gray-600 truncate">{image.originalName}</p>
                {image.ocrText && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{image.ocrText}</p>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

