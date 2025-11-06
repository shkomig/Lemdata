import { create } from 'zustand'
import { User } from './auth'
import { authApi } from './auth'

interface AuthStore {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => {
    set({ user, isAuthenticated: !!user })
  },

  login: async (email, password) => {
    try {
      const response = await authApi.login({ email, password })
      set({ user: response.user, isAuthenticated: true })
    } catch (error) {
      throw error
    }
  },

  register: async (email, password, name) => {
    try {
      const response = await authApi.register({ email, password, name })
      set({ user: response.user, isAuthenticated: true })
    } catch (error) {
      throw error
    }
  },

  logout: () => {
    authApi.logout()
    set({ user: null, isAuthenticated: false })
  },

  checkAuth: async () => {
    try {
      const storedUser = authApi.getStoredUser()
      if (storedUser && authApi.isAuthenticated()) {
        // Verify token is still valid
        const user = await authApi.getCurrentUser()
        set({ user, isAuthenticated: true, isLoading: false })
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false })
      }
    } catch (error) {
      authApi.logout()
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },
}))

