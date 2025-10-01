import { Collection, ObjectId } from 'mongodb'
import { getDatabase } from '@/lib/mongodb'

export interface Saving {
  month: string
  amount: number
}

export interface YearlySaving {
  _id?: ObjectId
  id: string
  savings: Saving[]
  createdAt?: Date
  updatedAt?: Date
}

export class SavingService {
  private static async getCollection(): Promise<Collection<YearlySaving>> {
    const db = await getDatabase()
    return db.collection<YearlySaving>('savings')
  }

  /**
   * Obtener ahorros de un año específico
   */
  static async getSavings(year: string): Promise<YearlySaving | null> {
    try {
      const collection = await this.getCollection()
      return await collection.findOne({ id: year })
    } catch (error) {
      console.error('Error getting savings:', error)
      return null
    }
  }

  /**
   * Obtener ahorro de un mes específico
   */
  static async getMonthlySaving(year: string, month: string): Promise<number> {
    const yearlySaving = await this.getSavings(year)
    if (!yearlySaving) return 0

    const monthSaving = yearlySaving.savings.find(
      s => s.month.toLowerCase() === month.toLowerCase()
    )
    return monthSaving?.amount || 0
  }

  /**
   * Crear o actualizar ahorros de un año
   */
  static async upsertYearlySaving(year: string, savings: Saving[]): Promise<YearlySaving> {
    const collection = await this.getCollection()

    const result = await collection.findOneAndUpdate(
      { id: year },
      {
        $set: {
          savings,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          id: year,
          createdAt: new Date(),
        },
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )

    return result!
  }

  /**
   * Actualizar ahorro de un mes específico
   */
  static async updateMonthlySaving(
    year: string,
    month: string,
    amount: number
  ): Promise<YearlySaving | null> {
    const collection = await this.getCollection()

    const result = await collection.findOneAndUpdate(
      {
        id: year,
        'savings.month': month
      },
      {
        $set: {
          'savings.$.amount': amount,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    )

    // Si no existe el mes, lo agregamos
    if (!result) {
      return await collection.findOneAndUpdate(
        { id: year },
        {
          $push: {
            savings: { month, amount }
          },
          $set: {
            updatedAt: new Date(),
          },
          $setOnInsert: {
            id: year,
            createdAt: new Date(),
          },
        },
        {
          upsert: true,
          returnDocument: 'after'
        }
      )
    }

    return result
  }
}