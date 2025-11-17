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
  gamesCreated: number
  gamesPlayed: number
  createdAt: string
  updatedAt: string
}

// Game Types
export enum GameType {
  FILL_IN_BLANKS = 'FILL_IN_BLANKS',    // השלמת משפטים
  MATCHING = 'MATCHING',                 // התאמות
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',   // בחירה מרובה
  WORD_ORDER = 'WORD_ORDER',             // סידור מילים
}

export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

// Game Content Types for each game type
export interface FillInBlanksContent {
  sentences: {
    text: string           // המשפט עם ____ במקום החסר
    answer: string         // התשובה הנכונה
    options?: string[]     // אופציות לבחירה (אופציונלי)
  }[]
}

export interface MatchingContent {
  pairs: {
    left: string          // פריט משמאל
    right: string         // פריט מימין
    id: string            // מזהה ייחודי
  }[]
}

export interface MultipleChoiceContent {
  questions: {
    question: string      // השאלה
    options: string[]     // אפשרויות תשובה
    correctAnswer: number // אינדקס של התשובה הנכונה
    explanation?: string  // הסבר (אופציונלי)
  }[]
}

export interface WordOrderContent {
  sentences: {
    correctOrder: string[]  // סדר נכון של המילים
    hint?: string          // רמז (אופציונלי)
  }[]
}

export type GameContent =
  | FillInBlanksContent
  | MatchingContent
  | MultipleChoiceContent
  | WordOrderContent

export interface Game {
  id: string
  userId: string
  imageId?: string
  title: string
  description?: string
  type: GameType
  difficulty: DifficultyLevel
  content: GameContent
  sourceText?: string
  aiModel?: string
  metadata?: any
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface GameSession {
  id: string
  userId: string
  gameId: string
  score: number
  maxScore: number
  completed: boolean
  timeSpent?: number
  answers?: any
  startedAt: string
  completedAt?: string
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

// Game API Request/Response types
export interface GenerateGameRequest {
  imageId?: string         // אופציונלי - אם רוצים ליצור משחק מתמונה קיימת
  sourceText?: string      // אופציונלי - אם רוצים ליצור משחק מטקסט ישירות
  gameType?: GameType      // אופציונלי - סוג משחק ספציפי, אחרת אוטומטי
  difficulty?: DifficultyLevel
  title?: string
}

export interface GenerateGameResponse {
  game: Game
  cost: number
  model: string
}

export interface SubmitGameAnswersRequest {
  gameId: string
  sessionId?: string
  answers: any
  timeSpent?: number
}

export interface SubmitGameAnswersResponse {
  session: GameSession
  feedback: {
    correct: number
    incorrect: number
    percentage: number
    details?: any
  }
}




