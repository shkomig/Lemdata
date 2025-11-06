import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'
import { prisma } from '../config/database'

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
        role: data.role || UserRole.STUDENT,
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
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (!user) {
      return null
    }

    // Verify password
    const isValid = await bcrypt.compare(data.password, user.password)

    if (!isValid) {
      return null
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user
    // Remove password from type
    return userWithoutPassword as UserWithoutPassword
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
