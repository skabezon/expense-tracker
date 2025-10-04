import { NextRequest } from 'next/server'
import { IncomeService } from '@/lib/services/incomeService'
import { SavingService } from '@/lib/services/savingService'
import { TransactionService } from '@/lib/services/transactionService'
import { getAuthenticatedUser } from '@/lib/api/auth'
import { successResponse, handleApiError } from '@/lib/api/response'
import { monthToNumber } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser()

    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    if (!year || !month) {
      throw new Error('Year and month are required')
    }

    // Get data from all services
    const [income, saving, transactions] = await Promise.all([
      IncomeService.getMonthlyIncome(year, month, user.id),
      SavingService.getMonthlySaving(year, month, user.id),
      TransactionService.findByUserId(user.id)
    ])

    const monthNumber = monthToNumber(month)

    // Filter transactions for the specified month
    const monthTransactions = transactions.filter(t => {
      const transDate = new Date(t.date)
      return (
        transDate.getFullYear().toString() === year &&
        transDate.getMonth() === new Date(`${year}-${monthNumber}-01`).getMonth()
      )
    })

    // Calculate total expenses
    const totalExpenses = monthTransactions.reduce(
      (sum, t) => sum + Math.abs(t.amount),
      0
    )

    return successResponse({
      income,
      saving,
      expenses: totalExpenses,
      transactions: monthTransactions
    })
  } catch (error) {
    return handleApiError(error, 'GET /dashboard')
  }
}