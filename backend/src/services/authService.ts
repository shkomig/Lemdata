import bcrypt from 'bcryptjs'
import { prisma } from '../config/database'

// Define UserRole type locally as fallback
type UserRole = 'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN'

export interface RegisterData {
  email: string
  password: string
  name: string
  role?: UserRole
}

export interface LoginData {
  email: string
  password: string
}

export type UserWithoutPassword = {
  id: string
  email: string
  name: string
  role: UserRole
  avatar: string | null
  createdAt: Date
  updatedAt: Date
}

export class AuthService {
  async register(data: RegisterData): Promise<UserWithoutPassword> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role || 'STUDENT',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return user as UserWithoutPassword
  }

  async login(data: LoginData): Promise<UserWithoutPassword | null> {
    try {
      console.log('Login attempt for email:', data.email)
      
      // Find user
      const user = await prisma.user.findUnique({
        where: { email: data.email },
      })

      if (!user) {
        console.log('User not found:', data.email)
        return null
      }

      console.log('User found, verifying password...')
      
      // Verify password
      const isValid = await bcrypt.compare(data.password, user.password)

      if (!isValid) {
        console.log('Invalid password for user:', data.email)
        return null
      }

      console.log('Login successful for user:', data.email)
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user
      // Remove password from type
      return userWithoutPassword as UserWithoutPassword
    } catch (error) {
      console.error('Login service error:', error)
      throw error
    }
  }

  async getUserById(id: string): Promise<UserWithoutPassword | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return user as UserWithoutPassword | null
  }

  async getUserByEmail(email: string): Promise<UserWithoutPassword | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return user as UserWithoutPassword | null
  }
}
