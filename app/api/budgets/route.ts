import { NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/api/auth'
import { BudgetService } from '@/lib/services/budgetService'
import { validateBody, BudgetSchema } from '@/lib/api/validation'
import { successResponse, handleApiError } from '@/lib/api/response'
import { z } from 'zod'

const QuerySchema = z.object({
  yearMonth: z.string().regex(/^\d{4}-\d{2}$/),
})

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser()

    const { searchParams } = new URL(request.url)
    const yearMonth = searchParams.get('yearMonth')

    if (!yearMonth) {
      throw new Error('Year and month are required in YYYY-MM format')
    }

    // Validar formato
    QuerySchema.parse({ yearMonth })

    const budgets = await BudgetService.getCategoryBudgets(user.id, yearMonth)
    return successResponse(budgets)
  } catch (error) {
    return handleApiError(error, 'GET /budgets')
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    const data = await validateBody(request, BudgetSchema)

    await BudgetService.setBudgets(user.id, data.yearMonth, data.budgets)
    return successResponse({ success: true }, 'Presupuestos guardados')
  } catch (error) {
    return handleApiError(error, 'POST /budgets')
  }
}