'use client'

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, AlertCircle, Target, Layers } from "lucide-react"
import type { Transaction } from '@/lib/types/transactions'
import type { CategoryBudget } from '@/lib/services/budgetService'

interface Props {
  transactions: Transaction[]
  budgets: CategoryBudget[]
}

export function CategoryStats({ transactions, budgets }: Props) {
  const activeCategories = new Set(transactions.map(t => t.category)).size
  
  const totalUnnecessary = transactions
    .filter(t => t.unnecessary)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const categoriesWithBudget = budgets.filter(b => b.amount > 0).length

  const categoryStats = Array.from(new Set(transactions.map(t => t.category))).map(cat => {
    const catTransactions = transactions.filter(t => t.category === cat)
    const spent = catTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const budget = budgets.find(b => b.category === cat)?.amount || 0
    return { spent, budget }
  })

  const avgBudgetUsed = categoryStats.length > 0
    ? categoryStats
        .filter(s => s.budget > 0)
        .reduce((sum, s) => sum + (s.spent / s.budget) * 100, 0) / 
        categoryStats.filter(s => s.budget > 0).length
    : 0

  const stats = [
    {
      title: "Categorías Activas",
      value: activeCategories,
      icon: Layers,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Con Presupuesto",
      value: categoriesWithBudget,
      icon: Target,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Promedio de Uso",
      value: `${avgBudgetUsed.toFixed(0)}%`,
      icon: TrendingUp,
      color: avgBudgetUsed > 90 ? "text-red-500" : "text-primary",
      bgColor: avgBudgetUsed > 90 ? "bg-red-500/10" : "bg-primary/10",
    },
    {
      title: "Gastos Innecesarios",
      value: `$${totalUnnecessary.toFixed(0)}`,
      icon: AlertCircle,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}