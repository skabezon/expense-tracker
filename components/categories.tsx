"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Utensils,
  Car,
  Gamepad2,
  Zap,
  ShoppingBag,
  Heart,
  GraduationCap,
  MoreHorizontal,
  AlertTriangle,
} from "lucide-react"
import type { Transaction } from "@/lib/types/transactions"
import type { CategoryBudget } from "@/lib/services/budgetService"
import { BudgetDialog } from "./budget-dialog"

const categoryIcons = {
  Comida: Utensils,
  Transporte: Car,
  Entretenimiento: Gamepad2,
  Servicios: Zap,
  Compras: ShoppingBag,
  Salud: Heart,
  Educación: GraduationCap,
  Otros: MoreHorizontal,
}

type CategoryData = {
  name: string
  spent: number
  budget: number
  transactions: number
  unnecessary: number
  color: string
  trend: string
}

export function Categories() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<CategoryBudget[]>([])
  const [showBudgetDialog, setShowBudgetDialog] = useState(false)
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
    const fetchData = async () => {
      try {
        const [transResponse, budgetResponse] = await Promise.all([
          fetch('/api/transactions'),
          fetch(`/api/budgets?yearMonth=${selectedMonth}`)
        ])

        if (!transResponse.ok) throw new Error('Error al cargar transacciones')
        if (!budgetResponse.ok) throw new Error('Error al cargar presupuestos')

        const transData = await transResponse.json()
        const budgetData = await budgetResponse.json()

        const formattedData = transData.map((t: any): Transaction => {
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
        setBudgets(budgetData)
      } catch (error) {
        console.error('Error:', error)
      }
    }

    fetchData()
  }, [selectedMonth])

  const getCategoryData = (): CategoryData[] => {
    const filteredTransactions = transactions.filter(t => t.date.startsWith(selectedMonth))
    
    const categoryStats = Object.entries(categoryIcons).map(([name]) => {
      const categoryTransactions = filteredTransactions.filter(t => t.category === name)
      const spent = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
      const unnecessary = categoryTransactions
        .filter(t => t.unnecessary)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      const [year, month] = selectedMonth.split('-').map(Number)
      const prevMonth = month === 1 ? 12 : month - 1
      const prevYear = month === 1 ? year - 1 : year
      const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}`
      const prevTransactions = transactions
        .filter(t => t.date.startsWith(prevMonthStr) && t.category === name)
      const prevSpent = prevTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
      
      let trend = '0%'
      if (prevSpent > 0) {
        const trendValue = ((spent - prevSpent) / prevSpent) * 100
        trend = `${trendValue > 0 ? '+' : ''}${trendValue.toFixed(0)}%`
      } else if (spent > 0) {
        trend = '+100%'
      }

      // Obtener el presupuesto de la categoría
      const categoryBudget = budgets.find(b => b.category === name)
      const budget = categoryBudget?.amount || 0

      return {
        name,
        spent,
        budget,
        transactions: categoryTransactions.length,
        unnecessary,
        color: getCategoryColor(name),
        trend
      }
    })

    return categoryStats.sort((a, b) => b.spent - a.spent)
  }

  const getCategoryColor = (name: string): string => {
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
    return colors[name] || '#6b7280'
  }

  const categoriesData = getCategoryData()
  const activeCategories = categoriesData.filter(c => c.transactions > 0).length
  const totalUnnecessary = categoriesData.reduce((sum, c) => sum + c.unnecessary, 0)
  
  // Calcular promedio de presupuesto usado solo para categorías con presupuesto > 0
  const categoriesWithBudget = categoriesData.filter(c => c.budget > 0)
  const avgBudgetUsed = categoriesWithBudget.length > 0 
    ? categoriesWithBudget.reduce((sum, c) => sum + (c.spent / c.budget), 0) / categoriesWithBudget.length * 100 
    : 0

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-balance">Categorías</h1>
          <p className="text-muted-foreground">Análisis detallado por categoría de gasto</p>
        </div>
        <div className="flex gap-4 items-end">
          <div className="w-56">
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
          <Button variant="outline" onClick={() => setShowBudgetDialog(true)}>
            Configurar Presupuestos
          </Button>
        </div>
        <BudgetDialog 
          open={showBudgetDialog}
          onOpenChange={setShowBudgetDialog}
          yearMonth={selectedMonth}
          currentBudgets={budgets}
          onBudgetsUpdate={(newBudgets) => setBudgets(newBudgets)}
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{activeCategories}</div>
              <div className="text-sm text-muted-foreground">Categorías Activas</div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-warning">${totalUnnecessary.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Gastos Innecesarios</div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">{avgBudgetUsed.toFixed(0)}%</div>
              <div className="text-sm text-muted-foreground">Promedio de Presupuesto Usado</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categoriesData.map((category, index) => {
          const Icon = categoryIcons[category.name as keyof typeof categoryIcons]
          const percentage = category.budget > 0 ? (category.spent / category.budget) * 100 : 0
          const isOverBudget = percentage > 100
          const hasUnnecessary = category.unnecessary > 0

          return (
            <Card key={index} className={`glass glass-hover ${isOverBudget ? "border-destructive/50" : ""}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: category.color }} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{category.transactions} transacciones</p>
                    </div>
                  </div>
                  {hasUnnecessary && <AlertTriangle className="w-4 h-4 text-warning" />}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">${category.spent.toLocaleString()}</span>
                    <Badge variant={category.trend.startsWith("+") ? "destructive" : "secondary"} className="text-xs">
                      {category.trend}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {category.budget > 0 ? `de $${category.budget.toLocaleString()} presupuestado` : 'Sin presupuesto'}
                  </div>
                </div>

                {category.budget > 0 ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progreso</span>
                      <span className={isOverBudget ? "text-destructive font-medium" : ""}>
                        {Math.round(percentage)}%
                      </span>
                    </div>
                    <Progress
                      value={Math.min(percentage, 100)}
                      className="h-2"
                      style={
                        {
                          "--progress-background": isOverBudget ? "hsl(var(--destructive))" : category.color,
                        } as React.CSSProperties
                      }
                    />
                    <div className="text-xs text-muted-foreground">
                      {isOverBudget ? (
                        <span className="text-destructive">
                          Excedido por ${(category.spent - category.budget).toLocaleString()}
                        </span>
                      ) : (
                        <span>Restante ${(category.budget - category.spent).toLocaleString()}</span>
                      )}
                    </div>
                    {hasUnnecessary && (
                      <div className="text-xs text-warning">
                        ${category.unnecessary.toLocaleString()} en gastos innecesarios
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground italic">
                    Configura un presupuesto para hacer seguimiento
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Categories with Most Unnecessary Expenses */}
      <Card className="glass border-warning/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-warning">
            <AlertTriangle className="w-5 h-5" />
            Categorías con Más Gastos Innecesarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoriesData
              .filter((cat) => cat.unnecessary > 0)
              .sort((a, b) => b.unnecessary - a.unnecessary)
              .map((category, index) => {
                const Icon = categoryIcons[category.name as keyof typeof categoryIcons]
                const unnecessaryPercentage = category.spent > 0 ? (category.unnecessary / category.spent) * 100 : 0

                return (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 rounded-lg bg-warning/5 border border-warning/20"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: category.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{category.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {Math.round(unnecessaryPercentage)}% de gastos innecesarios
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-warning">${category.unnecessary.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">de ${category.spent.toLocaleString()} total</div>
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}