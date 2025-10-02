import { NextResponse } from 'next/server'
import { IncomeService } from '@/lib/services/incomeService'
import { SavingService } from '@/lib/services/savingService'
import { TransactionService } from '@/lib/services/transactionService'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { monthToNumber } from '@/lib/utils'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = request.headers.get("x-user-id")
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    if (!year || !month) {
      return NextResponse.json(
        { error: 'Year and month are required' },
        { status: 400 }
      )
    }

    // Get data from all services
    const [income, saving, transactions] = await Promise.all([
      IncomeService.getMonthlyIncome(year, month, userId as string),
      SavingService.getMonthlySaving(year, month, userId as string),
      TransactionService.findByUserId(userId || session.user.email)
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

    return NextResponse.json({
      income,
      saving,
      expenses: totalExpenses,
      transactions: monthTransactions
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}