'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Transaction } from "@/lib/types/transactions"
import type { CategoryBudget } from "@/lib/services/budgetService"

interface Props {
  transactions: Transaction[]
  budgets: CategoryBudget[]
}

export function CategoryBreakdown({ transactions, budgets }: Props) {
  const getCategoryData = () => {
    const categories = Array.from(new Set(transactions.map(t => t.category)))

    return categories.map(category => {
      const categoryTransactions = transactions.filter(t => t.category === category)
      const spent = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
      const budget = budgets.find(b => b.category === category)?.amount || 0
      const percentage = budget > 0 ? (spent / budget) * 100 : 0

      return {
        category,
        spent,
        budget,
        percentage,
        transactions: categoryTransactions.length,
      }
    }).sort((a, b) => b.spent - a.spent)
  }

  const categoryData = getCategoryData()

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>Breakdown por Categoría</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {categoryData.map((cat) => (
            <div key={cat.category} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{cat.category}</span>
                <span className="text-sm text-muted-foreground">
                  ${cat.spent.toFixed(2)} / ${cat.budget.toFixed(2)}
                </span>
              </div>
              <Progress 
                value={Math.min(cat.percentage, 100)} 
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{cat.transactions} transacciones</span>
                <span>{cat.percentage.toFixed(0)}% del presupuesto</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}