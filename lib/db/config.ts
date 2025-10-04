import { MongoClient, Db, Collection } from 'mongodb'
import { env } from '@/lib/config/env'

export const Collections = {
  USERS: 'users',
  TRANSACTIONS: 'transactions',
  BUDGETS: 'budgets',
  INCOMES: 'incomes',
  SAVINGS: 'savings',
} as const

export type CollectionName = typeof Collections[keyof typeof Collections]

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

const options = {
  maxPoolSize: 10,
  minPoolSize: 2,
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  try {
    const client = await MongoClient.connect(env.MONGODB_URI, options)
    const db = client.db(env.MONGODB_DB_NAME)

    cachedClient = client
    cachedDb = db

    if (isDevelopment) {
      console.log('✅ Conectado a MongoDB:', env.MONGODB_DB_NAME)
    }

    await createIndexes(db)
    return { client, db }
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error)
    throw new Error('No se pudo conectar a la base de datos')
  }
}

export async function getDatabase(): Promise<Db> {
  const { db } = await connectToDatabase()
  return db
}

export async function getCollection<T = any>(name: CollectionName): Promise<Collection<T>> {
  const db = await getDatabase()
  return db.collection<T>(name)
}

async function createIndexes(db: Db): Promise<void> {
  try {
    await db.collection(Collections.USERS).createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { googleId: 1 }, sparse: true },
    ])

    await db.collection(Collections.TRANSACTIONS).createIndexes([
      { key: { userId: 1, date: -1 } },
      { key: { userId: 1, category: 1 } },
    ])

    await db.collection(Collections.BUDGETS).createIndexes([
      { key: { userId: 1, yearMonth: 1 }, unique: true },
    ])

    if (env.NODE_ENV === 'development') {
      console.log('✅ Índices de MongoDB creados')
    }
  } catch (error) {
    console.error('⚠️  Error creando índices:', error)
  }
}

export async function isDatabaseHealthy(): Promise<boolean> {
  try {
    const db = await getDatabase()
    await db.admin().ping()
    return true
  } catch {
    return false
  }
}

// Mantener compatibilidad con código existente
export const dbClient = connectToDatabase().then(({ client }) => client)