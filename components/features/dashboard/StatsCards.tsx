'use client'

import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, TrendingDown, PiggyBank, TrendingUp } from "lucide-react"

interface Props {
  income: number
  expenses: number
  saving: number
}

export function StatsCards({ income, expenses, saving }: Props) {
  const balance = income - expenses - saving

  const stats = [
    {
      title: "Ingresos",
      value: `$${income.toFixed(2)}`,
      change: "0%",
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Gastos",
      value: `$${expenses.toFixed(2)}`,
      change: "0%",
      icon: TrendingDown,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      title: "Balance",
      value: `$${balance.toFixed(2)}`,
      change: "0%",
      icon: DollarSign,
      color: balance >= 0 ? "text-primary" : "text-red-500",
      bgColor: balance >= 0 ? "bg-primary/10" : "bg-red-500/10",
    },
    {
      title: "Ahorros",
      value: `$${saving.toFixed(2)}`,
      change: "0%",
      icon: PiggyBank,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                {/* <p className="text-xs text-muted-foreground">{stat.change} vs mes anterior</p> */}
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}