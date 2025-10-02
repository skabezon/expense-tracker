import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { BudgetService, type CategoryBudget } from '@/lib/services/budgetService'

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
    const yearMonth = searchParams.get('yearMonth')

    if (!yearMonth) {
      return NextResponse.json(
        { error: 'Year and month are required in YYYY-MM format' },
        { status: 400 }
      )
    }

    const budgets = await BudgetService.getCategoryBudgets(userId as string, yearMonth)
    return NextResponse.json(budgets)

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = request.headers.get("x-user-id")
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { yearMonth, budgets } = await request.json()

    if (!yearMonth || !budgets || !Array.isArray(budgets)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    await BudgetService.setBudgets(userId as string, yearMonth, budgets)
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}