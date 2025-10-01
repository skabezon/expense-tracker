"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, AlertTriangle, User, Calendar } from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import type { Transaction } from "@/lib/types/transactions"

interface DashboardData {
  income: number
  saving: number
  expenses: number
  transactions: Transaction[]
}

export function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date()
    const month = today.toLocaleString('es-ES', { month: 'long' }).toLowerCase()
    return month
  })

  const [selectedYear, setSelectedYear] = useState(() => {
    return new Date().getFullYear().toString()
  })

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    income: 0,
    saving: 0,
    expenses: 0,
    transactions: []
  })

  const [availableMonths] = useState(() => {
    const currentDate = new Date()
    const months = []
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), i, 1)
      if (date <= currentDate) {
        months.push({
          value: date.toLocaleString('es-ES', { month: 'long' }).toLowerCase(),
          label: date.toLocaleString('es-ES', { month: 'long', year: 'numeric' })
        })
      }
    }
    return months.reverse() // Más recientes primero
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(
          `/api/dashboard?year=${selectedYear}&month=${selectedMonth}`
        )
        if (!response.ok) throw new Error('Error al cargar datos')
        const data = await response.json()
        setDashboardData(data)
      } catch (error) {
        console.error('Error:', error)
      }
    }

    fetchDashboardData()
  }, [selectedMonth, selectedYear])

  // Calcular datos para las tarjetas de resumen
  const summaryData = [
    {
      title: "Ingresos Totales",
      value: `$${(dashboardData.income / 1000).toFixed(0)}K`,
      change: "0%",
      icon: TrendingUp,
      color: "text-success"
    },
    {
      title: "Gastos Totales",
      value: `$${(dashboardData.expenses / 1000).toFixed(0)}K`,
      change: "0%",
      icon: TrendingDown,
      color: "text-destructive"
    },
    {
      title: "Balance",
      value: `$${((dashboardData.income - dashboardData.expenses) / 1000).toFixed(0)}K`,
      change: "0%",
      icon: DollarSign,
      color: "text-primary"
    },
    {
      title: "Ahorros",
      value: `$${(dashboardData.saving / 1000).toFixed(0)}K`,
      change: "0%",
      icon: PiggyBank,
      color: "text-accent"
    },
  ]

  // Calcular distribución de gastos por categoría
  const expenseBreakdown = Array.from(
    dashboardData.transactions.reduce((acc, transaction) => {
      const category = transaction.category
      const current = acc.get(category) || { amount: 0, count: 0 }
      acc.set(category, {
        amount: current.amount + Math.abs(transaction.amount),
        count: current.count + 1
      })
      return acc
    }, new Map())
  ).map(([name, { amount }]) => ({
    name,
    value: (amount / dashboardData.expenses) * 100,
    amount,
    color: getCategoryColor(name)
  })).sort((a, b) => b.amount - a.amount)

  // Calcular datos de crédito vs débito
  const creditDebitData = Array.from(
    dashboardData.transactions.reduce((acc, transaction) => {
      const method = transaction.method
      const current = acc.get(method) || 0
      acc.set(method, current + Math.abs(transaction.amount))
      return acc
    }, new Map())
  ).map(([name, value]) => ({
    name,
    value,
    color: name === "Crédito" ? "#f59e0b" : "#06b6d4"
  }))

  // Calcular gastos innecesarios
  const unnecessaryExpenses = dashboardData.transactions
    .filter(t => t.unnecessary)
    .map(t => ({
      item: t.description,
      amount: Math.abs(t.amount)
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Dashboard Financiero</h1>
          <p className="text-muted-foreground">Resumen de tu actividad financiera</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-56 glass">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="glass bg-transparent">
            <User className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryData.map((item, index) => {
          const Icon = item.icon
          return (
            <Card key={index} className="glass glass-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
                <Icon className={`w-5 h-5 ${item.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={item.color}>{item.change}</span> desde el mes pasado
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown Pie Chart */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Distribución de Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            {expenseBreakdown.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenseBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, "Porcentaje"]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {expenseBreakdown.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-muted-foreground">{item.name}</span>
                      <span className="text-sm font-medium ml-auto">${item.amount}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">No hay datos para mostrar</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Credit vs Debit */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Crédito vs Débito</CardTitle>
          </CardHeader>
          <CardContent>
            {creditDebitData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={creditDebitData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {creditDebitData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-4">
                  {creditDebitData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="secondary" style={{ backgroundColor: item.color }} className="text-white">
                        {item.name}
                      </Badge>
                      <span className="text-sm font-medium">${item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground">No hay datos para mostrar</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Unnecessary Expenses */}
        <Card className="glass border-warning/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="w-5 h-5" />
              Gastos Innecesarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            {unnecessaryExpenses.length > 0 ? (
              <div className="space-y-4">
                {unnecessaryExpenses.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{item.item}</span>
                    <span className="font-medium text-warning">${item.amount}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No hay gastos innecesarios</p>
            )}
          </CardContent>
        </Card>

        {/* Financial Tips or Goals */}
        <Card className="glass lg:col-span-2">
          <CardHeader>
            <CardTitle>Resumen Financiero</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tasa de Ahorro</p>
                  <p className="text-xl font-bold">
                    {dashboardData.income > 0
                      ? `${((dashboardData.saving / dashboardData.income) * 100).toFixed(1)}%`
                      : "0%"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gastos vs Ingresos</p>
                  <p className="text-xl font-bold">
                    {dashboardData.income > 0
                      ? `${((dashboardData.expenses / dashboardData.income) * 100).toFixed(1)}%`
                      : "0%"}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Balance General</p>
                <Progress
                  value={(dashboardData.expenses / dashboardData.income) * 100}
                  className="h-2"
                  style={
                    {
                      "--progress-background": getProgressColor(dashboardData.expenses / dashboardData.income),
                    } as React.CSSProperties
                  }
                />
              </div>

              {unnecessaryExpenses.length > 0 && (
                <div className="pt-4">
                  <p className="text-sm font-medium text-warning">Sugerencias de ahorro:</p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-2">
                    <li>Considera reducir gastos en categorías innecesarias</li>
                    <li>
                      Podrías ahorrar hasta $
                      {unnecessaryExpenses
                        .reduce((total, item) => total + item.amount, 0)
                        .toFixed(0)} este mes
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function getCategoryColor(category: string): string {
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

function getProgressColor(ratio: number): string {
  if (ratio >= 0.9) return 'hsl(var(--destructive))'
  if (ratio >= 0.7) return 'hsl(var(--warning))'
  return 'hsl(var(--success))'
}