import { z } from 'zod'
import { NextRequest } from 'next/server'

// ========== SCHEMAS ==========

export const TransactionSchema = z.object({
  amount: z.number().positive('El monto debe ser positivo'),
  category: z.enum([
    'Comida',
    'Transporte',
    'Entretenimiento',
    'Servicios',
    'Compras',
    'Salud',
    'Educación',
    'Otros',
  ]),
  date: z.string().datetime('Fecha inválida'),
  description: z.string().min(1).max(200),
  method: z.enum(['Crédito', 'Débito']),
  unnecessary: z.boolean().optional().default(false),
})

export const TransactionUpdateSchema = TransactionSchema.partial()

export const CategoryBudgetSchema = z.object({
  category: z.string().min(1),
  amount: z.number().min(0),
})

export const BudgetSchema = z.object({
  yearMonth: z.string().regex(/^\d{4}-\d{2}$/, 'Formato debe ser YYYY-MM'),
  budgets: z.array(CategoryBudgetSchema),
})

export const IncomeSchema = z.object({
  year: z.string().regex(/^\d{4}$/),
  month: z.string().regex(/^(0[1-9]|1[0-2])$/),
  amount: z.number().positive(),
})

export const SavingSchema = z.object({
  year: z.string().regex(/^\d{4}$/),
  month: z.string().regex(/^(0[1-9]|1[0-2])$/),
  amount: z.number().min(0),
})

// ========== HELPERS ==========

export class ValidationError extends Error {
  constructor(public errors: z.ZodIssue[]) {
    super('Validation failed')
    this.name = 'ValidationError'
  }

  toJSON() {
    return {
      error: 'Validation failed',
      details: this.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      })),
    }
  }
}

export async function validateBody<T extends z.ZodType>(
  request: NextRequest | Request,
  schema: T
): Promise<z.infer<T>> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(error.errors)
    }
    throw new Error('Invalid JSON')
  }
}

export function validateQuery<T extends z.ZodType>(
  request: NextRequest,
  schema: T
): z.infer<T> {
  try {
    const searchParams = request.nextUrl.searchParams
    const params = Object.fromEntries(searchParams.entries())
    return schema.parse(params)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(error.errors)
    }
    throw new Error('Invalid query parameters')
  }
}