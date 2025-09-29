import { Collection, ObjectId } from 'mongodb'
import { getDatabase } from '@/lib/mongodb'

interface Transaction {
  _id: ObjectId
  userId: string
  date: Date
  description: string
  category: string
  amount: number
  method: string
  unnecessary: boolean
  createdAt: Date
  updatedAt: Date
  tags?: string
}

interface CreateTransactionInput {
  userId: string
  date: Date
  description: string
  category: string
  amount: number
  method: string
  unnecessary: boolean
  tags?: string
}

interface UpdateTransactionInput extends Partial<CreateTransactionInput> {
  id: string
}

export class TransactionService {
  private static async getCollection(): Promise<Collection<Transaction>> {
    const db = await getDatabase()
    return db.collection<Transaction>('transactions')
  }

  /**
   * Obtener todas las transacciones de un usuario
   */
  static async findByUserId(userId: string): Promise<Transaction[]> {
    const collection = await this.getCollection()
    return await collection.find({ userId }).sort({ date: -1 }).toArray()
  }

  /**
   * Buscar transacción por ID
   */
  static async findById(id: string): Promise<Transaction | null> {
    try {
      const collection = await this.getCollection()
      return await collection.findOne({ _id: new ObjectId(id) })
    } catch (error) {
      return null
    }
  }

  /**
   * Crear nueva transacción
   */
  static async create(transactionData: CreateTransactionInput): Promise<Transaction> {
    const collection = await this.getCollection()

    const newTransaction: Omit<Transaction, '_id'> = {
      ...transactionData,
      date: new Date(transactionData.date),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(newTransaction as any)
    return {
      _id: result.insertedId,
      ...newTransaction,
    }
  }

  /**
   * Actualizar transacción
   */
  static async update(data: UpdateTransactionInput): Promise<Transaction | null> {
    const collection = await this.getCollection()
    const { id, ...updateData } = data

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    )

    return result || null
  }

  /**
   * Eliminar transacción
   */
  static async delete(id: string): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }

  /**
   * Obtener transacciones por mes
   */
  static async findByMonth(userId: string, month: number, year: number): Promise<Transaction[]> {
    const collection = await this.getCollection()
    const startDate = new Date(year, month + 1, 1)
    const endDate = new Date(year, month + 1, 0)


    return await collection
      .find({
        userId,
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .sort({ date: -1 })
      .toArray()
  }

  /**
   * Obtener total de gastos por categoría en un mes
   */
  static async getTotalsByCategory(userId: string, month: number, year: number): Promise<{ category: string; total: number }[]> {
    const collection = await this.getCollection()
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)

    const result = await collection
      .aggregate([
        {
          $match: {
            userId,
            date: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
          },
        },
        {
          $project: {
            _id: 0,
            category: '$_id',
            total: 1,
          },
        },
      ])
      .toArray()

    return result
  }
}