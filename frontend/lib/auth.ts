import api from './api'

export interface User {
  id: string
  email: string
  name: string
  role: 'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN'
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  role?: 'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN'
}

export interface AuthResponse {
  user: User
  token: string
}

export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', data)
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/register', data)
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<{ user: User }>('/api/auth/me')
    return response.data.user
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },

  getStoredUser: (): User | null => {
    if (typeof window === 'undefined') return null
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem('token')
  },
}

