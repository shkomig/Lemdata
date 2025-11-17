import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

// Game API functions
export const gameAPI = {
  /**
   * יוצר משחק חדש מתמונה או טקסט
   */
  generateGame: async (data: {
    imageId?: string
    sourceText?: string
    gameType?: string
    difficulty?: string
    title?: string
  }) => {
    const response = await api.post('/api/games/generate', data)
    return response.data
  },

  /**
   * מחזיר את כל המשחקים של המשתמש
   */
  getGames: async () => {
    const response = await api.get('/api/games')
    return response.data
  },

  /**
   * מחזיר משחק ספציפי
   */
  getGame: async (gameId: string) => {
    const response = await api.get(`/api/games/${gameId}`)
    return response.data
  },

  /**
   * שולח תשובות ומקבל הערכה
   */
  submitAnswers: async (
    gameId: string,
    data: {
      sessionId?: string
      answers: any
      timeSpent?: number
    }
  ) => {
    const response = await api.post(`/api/games/${gameId}/play`, data)
    return response.data
  },

  /**
   * מוחק משחק
   */
  deleteGame: async (gameId: string) => {
    const response = await api.delete(`/api/games/${gameId}`)
    return response.data
  },

  /**
   * מחזיר את כל ה-sessions של משחק
   */
  getGameSessions: async (gameId: string) => {
    const response = await api.get(`/api/games/${gameId}/sessions`)
    return response.data
  },
}




