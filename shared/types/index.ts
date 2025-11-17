// Shared types between frontend and backend

export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  PARENT = 'PARENT',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface Conversation {
  id: string
  userId: string
  title?: string
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  conversationId: string
  userId: string
  content: string
  role: 'user' | 'assistant'
  model?: string
  cost: number
  metadata?: any
  createdAt: string
}

export interface Image {
  id: string
  userId: string
  url: string
  originalName: string
  size: number
  mimeType: string
  ocrText?: string
  analysis?: any
  createdAt: string
}

export interface UserAnalytics {
  id: string
  userId: string
  date: string
  questionsAsked: number
  aiCostTotal: number
  aiQueriesGemini: number
  aiQueriesHugging: number
  aiQueriesLocal: number
  imagesUploaded: number
  createdAt: string
  updatedAt: string
}

// API Request/Response types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  role?: UserRole
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

export interface ChatRequest {
  message: string
  conversationId?: string
  model?: 'auto' | 'gemini' | 'huggingface' | 'ollama'
  history?: Message[]
}

export interface ChatResponse {
  message: Message
  conversationId: string
  suggestions?: string[]
}




