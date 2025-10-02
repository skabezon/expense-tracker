import { MongoClient, Db } from 'mongodb'

if (!process.env.MONGODB_HOST || !process.env.MONGODB_USER || !process.env.MONGODB_PASSWORD) {
  throw new Error('Please define the MONGODB_HOST, MONGODB_USER and MONGODB_PASSWORD environment variables inside .env.local')
}

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/?retryWrites=true&w=majority`

const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

if (process.env.NODE_ENV === 'development') {
  // En desarrollo, usa una variable global para preservar el cliente
  // a través de hot reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // En producción, es mejor no usar una variable global
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Función helper para obtener la base de datos
export async function getDatabase(): Promise<Db> {
  const client = await clientPromise
  return client.db('expense-tracker') // Nombre de tu base de datos
}

export default clientPromise