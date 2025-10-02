"use client"

import { useState, useEffect } from "react"
import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { TrendingUp, TrendingDown, AlertTriangle, Target } from "lucide-react"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { Transaction } from "@/lib/types/transactions"
import type { CategoryBudget } from "@/lib/services/budgetService"

export function Analytics() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<CategoryBudget[]>([])
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  })

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

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/transactions')
        if (!response.ok) throw new Error('Error al cargar transacciones')
        const data = await response.json()
        const formattedData = data.map((t: any): Transaction => {
          const date = new Date(t.date)
          date.setMinutes(date.getMinutes() + date.getTimezoneOffset())
          return {
            id: t._id,
            date: date.toISOString().split('T')[0],
            description: t.description,
            category: t.category,
            amount: t.amount,
            method: t.method,
            unnecessary: t.unnecessary,
            tags: t.tags || ''
          }
        })
        setTransactions(formattedData)
      } catch (error) {
        console.error('Error:', error)
      }
    }

    fetchTransactions()
  }, [])

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const response = await fetch(`/api/budgets?yearMonth=${selectedMonth}`)
        if (!response.ok) throw new Error('Error al cargar presupuestos')
        const data = await response.json()
        setBudgets(data)
      } catch (error) {
        console.error('Error:', error)
      }
    }

    fetchBudgets()
  }, [selectedMonth])

  const getBudgetForCategory = (category: string): number => {
    const budget = budgets.find(b => b.category === category)
    return budget?.amount || 0
  }

  const getMonthlyTransactions = () => {
    return transactions.filter(t => t.date.startsWith(selectedMonth))
  }

  const getCategoryData = () => {
    const monthlyTransactions = getMonthlyTransactions()
    const categories = Array.from(new Set(monthlyTransactions.map(t => t.category)))
    const total = monthlyTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)

    return categories.map(category => {
      const categoryTransactions = monthlyTransactions.filter(t => t.category === category)
      const amount = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
      const budget = getBudgetForCategory(category)
      const unnecessary = categoryTransactions
        .filter(t => t.unnecessary)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      return {
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        budget,
        color: getCategoryColor(category),
        unnecessary,
        items: categoryTransactions
          .filter(t => t.unnecessary)
          .map(t => t.description)
      }
    }).sort((a, b) => b.amount - a.amount)
  }

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      Comida: '#8b5cf6',
      Transporte: '#06b6d4',
      Entretenimiento: '#10b981',
      Servicios: '#f59e0b',
      Compras: '#ef4444',
      Salud: '#ec4899',
      Educación: '#8b5cf6',
      Otros: '#6b7280'
    }
    return colors[category] || '#6b7280'
  }

  const getCreditDebitData = () => {
    const monthlyTransactions = getMonthlyTransactions()
    const total = monthlyTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const credit = monthlyTransactions
      .filter(t => t.method === "Crédito")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const debit = total - credit

    return [
      { name: "Crédito", value: total > 0 ? (credit / total) * 100 : 0, amount: credit, color: "#f59e0b" },
      { name: "Débito", value: total > 0 ? (debit / total) * 100 : 0, amount: debit, color: "#06b6d4" },
    ]
  }

  const getUnnecessaryExpenses = () => {
    const monthlyTransactions = getMonthlyTransactions()
    const total = monthlyTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const unnecessary = monthlyTransactions
      .filter(t => t.unnecessary)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const byCategory = Object.entries(
      monthlyTransactions
        .filter(t => t.unnecessary)
        .reduce((acc, t) => {
          const cat = t.category
          if (!acc[cat]) {
            acc[cat] = { amount: 0, items: [] }
          }
          acc[cat].amount += Math.abs(t.amount)
          acc[cat].items.push(t.description)
          return acc
        }, {} as Record<string, { amount: number; items: string[] }>)
    ).map(([category, data]) => ({
      category,
      amount: data.amount,
      items: data.items
    })).sort((a, b) => b.amount - a.amount)

    return {
      total: unnecessary,
      percentage: total > 0 ? (unnecessary / total) * 100 : 0,
      byCategory
    }
  }

  const getMonthlyComparison = () => {
    const [year, month] = selectedMonth.split('-').map(Number)
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}`

    const categories = Array.from(new Set(transactions.map(t => t.category)))

    return categories.map(category => {
      const currentAmount = getMonthlyTransactions()
        .filter(t => t.category === category)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      const previousAmount = transactions
        .filter(t => t.date.startsWith(prevMonthStr) && t.category === category)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      return {
        category,
        current: currentAmount,
        previous: previousAmount
      }
    }).sort((a, b) => b.current - a.current)
  }

  const categoryData = getCategoryData()
  const creditDebitData = getCreditDebitData()
  const unnecessaryData = getUnnecessaryExpenses()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-balance">Análisis Financiero</h1>
          <p className="text-muted-foreground">Análisis detallado de tus patrones de gasto</p>
        </div>
        <div className="max-w-xs">
          <Label>Mes</Label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="glass">
              <SelectValue placeholder="Selecciona un mes" />
            </SelectTrigger>
            <SelectContent>
              {getAvailableMonths().map((month) => (
                <SelectItem key={month} value={month}>
                  {formatMonth(month)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Category Breakdown */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Desglose por Categoría</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {categoryData.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{item.category}</span>
                <div className="text-right">
                  <span className="font-bold">${item.amount.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground ml-2">de ${item.budget.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Progress
                  value={item.budget > 0 ? (item.amount / item.budget) * 100 : 0}
                  className="flex-1"
                  style={
                    {
                      "--progress-background": item.color,
                    } as React.CSSProperties
                  }
                />
                <span className="text-sm font-medium w-12 text-right">{item.percentage.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{item.budget > 0 ? Math.round((item.amount / item.budget) * 100) : 0}% del presupuesto</span>
                <span>${(item.budget - item.amount).toLocaleString()} restante</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Spending Categories */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Ranking de Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.category}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.percentage.toFixed(1)}% del total
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${item.amount.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Credit vs Debit Detailed */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Análisis Crédito vs Débito</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={creditDebitData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {creditDebitData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, "Porcentaje"]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {creditDebitData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${item.amount.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">{item.value.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unnecessary Expenses Analysis */}
        <Card className="glass border-warning/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="w-5 h-5" />
              Análisis de Gastos Innecesarios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">${unnecessaryData.total.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Innecesario</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">{unnecessaryData.percentage.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Del Total</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Por Categoría:</h4>
              {unnecessaryData.byCategory.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{item.category}</span>
                    <span className="text-warning font-bold">${item.amount.toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{item.items.join(", ")}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Comparison */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Comparación Mensual</CardTitle>
            <p className="text-sm text-muted-foreground">Mes actual vs anterior</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getMonthlyComparison()}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis
                  dataKey="category"
                  stroke="rgba(255, 255, 255, 0.7)"
                  tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                />
                <YAxis
                  stroke="rgba(255, 255, 255, 0.7)"
                  tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "8px",
                    color: "white"
                  }}
                />
                <Bar
                  dataKey="previous"
                  fill="rgba(156, 163, 175, 0.6)"
                  name="Mes Anterior"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="current"
                  fill="#06b6d4"
                  name="Mes Actual"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}