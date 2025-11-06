import api from './api'

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

export interface Conversation {
  id: string
  userId: string
  title?: string
  createdAt: string
  updatedAt: string
  _count?: {
    messages: number
  }
}

export interface ChatRequest {
  message: string
  conversationId?: string
  preferredModel?: 'auto' | 'gemini' | 'huggingface' | 'ollama'
}

export interface ChatResponse {
  text: string
  model: string
  cost: number
  conversationId: string
  metadata?: any
  suggestions?: string[]
}

export const chatApi = {
  sendMessage: async (data: ChatRequest): Promise<ChatResponse> => {
    const response = await api.post<ChatResponse>('/api/chat/chat', data)
    return response.data
  },

  getConversations: async (): Promise<{ conversations: Conversation[] }> => {
    const response = await api.get<{ conversations: Conversation[] }>('/api/chat/conversations')
    return response.data
  },

  getMessages: async (conversationId: string): Promise<{ messages: Message[] }> => {
    const response = await api.get<{ messages: Message[] }>(
      `/api/chat/conversations/${conversationId}/messages`
    )
    return response.data
  },

  getModelsStatus: async (): Promise<{ models: any }> => {
    const response = await api.get<{ models: any }>('/api/chat/models/status')
    return response.data
  },
}

