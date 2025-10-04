import { Collection, ObjectId } from "mongodb"
import { getCollection, Collections } from "@/lib/db/config"
import type { Transaction } from "@/lib/types/transactions"

export class TransactionService {
  private static async getCollection(): Promise<Collection<Transaction>> {
    return getCollection<Transaction>(Collections.TRANSACTIONS)
  }

  /**
   * Buscar todas las transacciones de un usuario
   */
  static async findByUserId(userId: string): Promise<Transaction[]> {
    const collection = await this.getCollection()
    return await collection
      .find({ userId })
      .sort({ date: -1 })
      .toArray()
  }

  /**
   * Buscar transacción por ID
   */
  static async findById(id: string): Promise<Transaction> {
    const collection = await this.getCollection()
    const transaction = await collection.findOne({ _id: new ObjectId(id) })

    if (!transaction) {
      throw new Error('Transacción no encontrada')
    }

    return transaction
  }

  /**
   * Crear nueva transacción
   */
  static async create(data: Omit<Transaction, "_id" | "createdAt" | "updatedAt">): Promise<Transaction> {
    const collection = await this.getCollection()

    // Validaciones de negocio
    if (data.amount <= 0) {
      throw new Error('El monto debe ser mayor a 0')
    }

    if (!data.description || data.description.trim().length === 0) {
      throw new Error('La descripción es requerida')
    }

    const now = new Date()
    const transaction: Transaction = {
      ...data,
      amount: -Math.abs(data.amount), // Asegurar que sea negativo (gasto)
      description: data.description.trim(),
      createdAt: now,
      updatedAt: now,
    }

    const result = await collection.insertOne(transaction as any)
    return { ...transaction, _id: result.insertedId }
  }

  /**
   * Actualizar transacción
   */
  static async update(
    id: string,
    data: Partial<Omit<Transaction, "_id" | "userId" | "createdAt">>
  ): Promise<Transaction> {
    const collection = await this.getCollection()

    // Validaciones
    if (data.amount !== undefined && data.amount <= 0) {
      throw new Error('El monto debe ser mayor a 0')
    }

    if (data.description !== undefined && data.description.trim().length === 0) {
      throw new Error('La descripción no puede estar vacía')
    }

    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    }

    if (data.amount !== undefined) {
      updateData.amount = -Math.abs(data.amount)
    }

    if (data.description !== undefined) {
      updateData.description = data.description.trim()
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    )

    if (!result) {
      throw new Error('Transacción no encontrada')
    }

    return result
  }

  /**
   * Eliminar transacción
   */
  static async delete(id: string): Promise<void> {
    const collection = await this.getCollection()
    const result = await collection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      throw new Error('Transacción no encontrada')
    }
  }

  /**
   * Obtener transacciones por mes
   */
  static async findByMonth(
    userId: string,
    year: string,
    month: string
  ): Promise<Transaction[]> {
    const collection = await this.getCollection()

    const monthNum = parseInt(month, 10)
    const yearNum = parseInt(year, 10)
    const startDate = new Date(yearNum, monthNum - 1, 1)
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59)

    return await collection
      .find({
        userId,
        date: { $gte: startDate, $lte: endDate },
      })
      .sort({ date: -1 })
      .toArray()
  }

  /**
   * Obtener estadísticas por categoría
   */
  static async getCategoryStats(
    userId: string,
    year: string,
    month: string
  ): Promise<Array<{ category: string; total: number; count: number }>> {
    const collection = await this.getCollection()

    const monthNum = parseInt(month, 10)
    const yearNum = parseInt(year, 10)
    const startDate = new Date(yearNum, monthNum - 1, 1)
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59)

    return await collection
      .aggregate([
        {
          $match: {
            userId,
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: '$category',
            total: { $sum: { $abs: '$amount' } },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            category: '$_id',
            total: 1,
            count: 1,
          },
        },
        {
          $sort: { total: -1 },
        },
      ])
      .toArray()
  }
}