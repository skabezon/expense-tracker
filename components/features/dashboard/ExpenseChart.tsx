'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts"
import type { Transaction } from "@/lib/types/transactions"

interface Props {
  transactions: Transaction[]
}

export function ExpenseChart({ transactions }: Props) {
  const getCategoryData = () => {
    const categories = Array.from(new Set(transactions.map(t => t.category)))
    const total = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)

    return categories.map(category => {
      const categoryTransactions = transactions.filter(t => t.category === category)
      const amount = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)

      return {
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
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
      {/* Gráfico de torta */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Distribución de Gastos</CardTitle>
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
                label={(entry) => `${entry.percentage.toFixed(0)}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de barras */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Gastos por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <XAxis 
                dataKey="category" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis fontSize={12} />
              <Tooltip formatter={(value: number) => `${value.toFixed(2)}`} />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}