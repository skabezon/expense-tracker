import { Collection, ObjectId } from 'mongodb'
import { getDatabase } from '@/lib/mongodb'
import { User, CreateUserInput, UpdateUserInput } from '@/lib/types/user'

export class UserService {
  private static async getCollection(): Promise<Collection<User>> {
    const db = await getDatabase()
    return db.collection<User>('users')
  }

  /**
   * Buscar usuario por email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ email })
  }

  /**
   * Buscar usuario por Google ID
   */
  static async findByGoogleId(_id: string): Promise<User | null> {
    const collection = await this.getCollection()
    return await collection.findOne({ _id } as any)
  }

  /**
   * Buscar usuario por ID
   */
  static async findById(id: string): Promise<User | null> {
    try {
      const collection = await this.getCollection()
      return await collection.findOne({ _id: id } as any)
    } catch (error) {
      return null
    }
  }

  /**
   * Crear nuevo usuario
   */
  static async create(userData: CreateUserInput): Promise<User> {
    const collection = await this.getCollection()

    const newUser: Omit<User, '_id'> = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(newUser as User)

    return {
      ...newUser,
      _id: result.insertedId,
    } as User
  }

  /**
   * Actualizar usuario
   */
  static async update(id: string, userData: UpdateUserInput): Promise<User | null> {
    try {
      const collection = await this.getCollection()

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...userData,
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      )

      return result || null
    } catch (error) {
      console.error('Error updating user:', error)
      return null
    }
  }

  /**
   * Eliminar usuario
   */
  static async delete(id: string): Promise<boolean> {
    try {
      const collection = await this.getCollection()
      const result = await collection.deleteOne({ _id: new ObjectId(id) })
      return result.deletedCount > 0
    } catch (error) {
      console.error('Error deleting user:', error)
      return false
    }
  }

  /**
   * Buscar o crear usuario con Google OAuth
   */
  static async findOrCreateGoogleUser(profile: {
    id: string
    email: string
    name: string
    image?: string
  }): Promise<User> {
    // Primero intentar buscar por Google ID
    let user = await this.findByGoogleId(profile.id)

    if (user) {
      // Actualizar información si es necesario
      if (user.name !== profile.name || user.image !== profile.image) {
        user = await this.update(user._id!.toString(), {
          name: profile.name,
          image: profile.image,
        })
      }
      return user!
    }

    // Si no existe, buscar por email (por si el usuario ya existe)
    user = await this.findByEmail(profile.email)

    if (user) {
      // Vincular cuenta de Google al usuario existente
      user = await this.update(user._id!.toString(), {
        googleId: profile.id,
        image: profile.image || user.image,
        emailVerified: new Date(),
      })
      return user!
    }

    // Si no existe, crear nuevo usuario
    return await this.create({
      email: profile.email,
      name: profile.name,
      image: profile.image,
      googleId: profile.id,
      emailVerified: new Date(),
    })
  }

  /**
   * Listar todos los usuarios (para administración)
   */
  static async findAll(limit: number = 100, skip: number = 0): Promise<User[]> {
    const collection = await this.getCollection()
    return await collection
      .find({})
      .limit(limit)
      .skip(skip)
      .toArray()
  }

  /**
   * Contar usuarios
   */
  static async count(): Promise<number> {
    const collection = await this.getCollection()
    return await collection.countDocuments()
  }
}