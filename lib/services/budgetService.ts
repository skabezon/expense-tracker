import { Collection, ObjectId } from 'mongodb'
import { getDatabase } from '@/lib/mongodb'

export interface CategoryBudget {
  category: string
  amount: number
}

export interface MonthlyBudget {
  _id?: ObjectId
  id: string // YYYY-MM format
  userId: string
  budgets: CategoryBudget[]
  createdAt?: Date
  updatedAt?: Date
}

export class BudgetService {
  private static async getCollection(): Promise<Collection<MonthlyBudget>> {
    const db = await getDatabase()
    return db.collection<MonthlyBudget>('budgets')
  }

  /**
   * Presupuestos por defecto
   */
  private static getDefaultBudgets(): CategoryBudget[] {
    return [
      { category: "Comida", amount: 1000000 },
      { category: "Transporte", amount: 300000 },
      { category: "Entretenimiento", amount: 200000 },
      { category: "Servicios", amount: 500000 },
      { category: "Compras", amount: 200000 },
      { category: "Salud", amount: 200000 },
      { category: "Educación", amount: 300000 },
      { category: "Otros", amount: 200000 }
    ]
  }

  /**
   * Obtener presupuestos de un mes específico
   */
  static async getCategoryBudgets(
    userId: string,
    yearMonth: string
  ): Promise<CategoryBudget[]> {
    try {
      const collection = await this.getCollection()
      const budget = await collection.findOne({
        _id: `${yearMonth}_${userId}` as any,
      })

      if (!budget) {
        return this.getDefaultBudgets()
      }

      return budget.budgets
    } catch (error) {
      console.error('Error getting budgets:', error)
      return this.getDefaultBudgets()
    }
  }

  /**
   * Obtener presupuesto completo de un mes
   */
  static async getMonthlyBudget(
    userId: string,
    yearMonth: string
  ): Promise<MonthlyBudget | null> {
    try {
      const collection = await this.getCollection()
      return await collection.findOne({
        _id: `${yearMonth}_${userId}` as any
      })
    } catch (error) {
      console.error('Error getting monthly budget:', error)
      return null
    }
  }

  /**
   * Crear o actualizar presupuestos de un mes
   */
  static async setBudgets(
    userId: string,
    yearMonth: string,
    budgets: CategoryBudget[]
  ): Promise<MonthlyBudget> {
    const collection = await this.getCollection()

    const result = await collection.findOneAndUpdate(
      { _id: `${yearMonth}_${userId}` as any },
      {
        $set: {
          budgets,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          _id: `${yearMonth}_${userId}` as any,
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
   * Actualizar presupuesto de una categoría específica
   */
  static async updateCategoryBudget(
    userId: string,
    yearMonth: string,
    category: string,
    amount: number
  ): Promise<MonthlyBudget | null> {
    const collection = await this.getCollection()

    const result = await collection.findOneAndUpdate(
      {
        _id: `${yearMonth}_${userId}` as any,
        'budgets.category': category
      },
      {
        $set: {
          'budgets.$.amount': amount,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    )

    // Si no existe la categoría, la agregamos
    if (!result) {
      return await collection.findOneAndUpdate(
        { _id: `${yearMonth}_${userId}` as any },
        {
          $push: {
            budgets: { category, amount }
          },
          $set: {
            updatedAt: new Date(),
          },
          $setOnInsert: {
            id: yearMonth,
            userId,
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