import { Collection, ObjectId } from 'mongodb'
import { getDatabase } from '@/lib/mongodb'

export interface Income {
  month: string
  amount: number
}

export interface YearlyIncome {
  _id?: ObjectId
  id: string
  incomes: Income[]
  createdAt?: Date
  updatedAt?: Date
}

export class IncomeService {
  private static async getCollection(): Promise<Collection<YearlyIncome>> {
    const db = await getDatabase()
    return db.collection<YearlyIncome>('incomes')
  }

  /**
   * Obtener ingresos de un año específico
   */
  static async getIncomes(year: string): Promise<YearlyIncome | null> {
    try {
      const collection = await this.getCollection()
      return await collection.findOne({ id: year })
    } catch (error) {
      console.error('Error getting incomes:', error)
      return null
    }
  }

  /**
   * Obtener ingreso de un mes específico
   */
  static async getMonthlyIncome(year: string, month: string): Promise<number> {
    const yearlyIncome = await this.getIncomes(year)
    if (!yearlyIncome) return 0

    const monthIncome = yearlyIncome.incomes.find(
      i => i.month.toLowerCase() === month.toLowerCase()
    )
    return monthIncome?.amount || 0
  }

  /**
   * Crear o actualizar ingresos de un año
   */
  static async upsertYearlyIncome(year: string, incomes: Income[]): Promise<YearlyIncome> {
    const collection = await this.getCollection()

    const result = await collection.findOneAndUpdate(
      { id: year },
      {
        $set: {
          incomes,
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
   * Actualizar ingreso de un mes específico
   */
  static async updateMonthlyIncome(
    year: string,
    month: string,
    amount: number
  ): Promise<YearlyIncome | null> {
    const collection = await this.getCollection()

    const result = await collection.findOneAndUpdate(
      {
        id: year,
        'incomes.month': month
      },
      {
        $set: {
          'incomes.$.amount': amount,
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
            incomes: { month, amount }
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