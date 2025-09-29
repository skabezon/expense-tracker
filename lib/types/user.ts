import { ObjectId } from 'mongodb'

export interface User {
  _id?: ObjectId
  email: string
  name: string
  image?: string
  googleId?: string // ID de Google OAuth
  emailVerified?: Date
  createdAt: Date
  updatedAt: Date
}

export interface UserSession {
  id: string
  email: string
  name: string
  image?: string
}

export type CreateUserInput = Omit<User, '_id' | 'createdAt' | 'updatedAt'>
export type UpdateUserInput = Partial<Omit<User, '_id' | 'email' | 'createdAt'>>