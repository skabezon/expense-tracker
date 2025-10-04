"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useTransactions } from "@/hooks/useTransactions"
import { AnalyticsCharts } from "./features/analytics/AnalyticsCharts"
import { CategoryBreakdown } from "./features/analytics/CategoryBreakdown"
import { MethodStats } from "./features/analytics/MethodStats"
import { UnnecessaryExpenses } from "./features/analytics/UnnecessaryExpenses"
import type { Transaction } from "@/lib/types/transactions"
import type { CategoryBudget } from "@/lib/services/budgetService"

export function Analytics() {
  const { transactions } = useTransactions()
  const [budgets, setBudgets] = useState<CategoryBudget[]>([])
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  })

  useEffect(() => {
    fetchBudgets()
  }, [selectedMonth])

  const fetchBudgets = async () => {
    try {
      const response = await fetch(`/api/budgets?yearMonth=${selectedMonth}`)
      if (!response.ok) throw new Error('Error al cargar presupuestos')
      const data = await response.json()
      setBudgets(data.success ? data.data : data)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const getAvailableMonths = () => {
    const months = new Set(transactions.map(t => {
      const date = new Date(t.date)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    }))
    return Array.from(months).sort().reverse()
  }

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(Number(year), Number(month) - 1, 1)
    return new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric' }).format(date)
  }

  const getMonthlyTransactions = () => {
    return transactions.filter(t => {
      const date = new Date(t.date)
      const transMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      return transMonth === selectedMonth
    })
  }

  const monthlyTransactions = getMonthlyTransactions()
  const availableMonths = getAvailableMonths()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <div className="flex items-center gap-4">
          <Label htmlFor="month-select">Mes:</Label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger id="month-select" className="w-[200px] glass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map((month) => (
                <SelectItem key={month} value={month}>
                  {formatMonth(month)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Gráficos principales */}
      <AnalyticsCharts 
        transactions={monthlyTransactions}
        budgets={budgets}
      />

      {/* Breakdown por categoría */}
      <CategoryBreakdown 
        transactions={monthlyTransactions}
        budgets={budgets}
      />

      {/* Estadísticas de métodos de pago */}
      <MethodStats transactions={monthlyTransactions} />

      {/* Gastos innecesarios */}
      <UnnecessaryExpenses transactions={monthlyTransactions} />
    </div>
  )
}