'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import type { Transaction } from "@/lib/types/transactions"
import type { CategoryBudget } from "@/lib/services/budgetService"

interface Props {
  transactions: Transaction[]
  budgets: CategoryBudget[]
}

export function AnalyticsCharts({ transactions, budgets }: Props) {
  const getCategoryData = () => {
    const categories = Array.from(new Set(transactions.map(t => t.category)))
    const total = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)

    return categories.map(category => {
      const categoryTransactions = transactions.filter(t => t.category === category)
      const amount = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
      const budget = budgets.find(b => b.category === category)?.amount || 0

      return {
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        budget,
        color: getCategoryColor(category),
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

  const categoryData = getCategoryData()

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Gráfico de categorías */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Gastos por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.category}: $${entry.amount.toFixed(0)}`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Resumen de estadísticas */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Resumen del Mes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total de Gastos:</span>
            <span className="text-2xl font-bold">
              ${transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Número de Transacciones:</span>
            <span className="text-xl font-semibold">{transactions.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Gasto Promedio:</span>
            <span className="text-xl font-semibold">
              ${transactions.length > 0 
                ? (transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactions.length).toFixed(2)
                : '0.00'
              }
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Categorías Activas:</span>
            <span className="text-xl font-semibold">{categoryData.length}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}