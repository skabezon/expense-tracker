"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, AlertTriangle, Target } from "lucide-react"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const categoryBreakdown = [
  { category: "Comida", amount: 867, percentage: 30, budget: 1000, color: "#8b5cf6" },
  { category: "Transporte", amount: 578, percentage: 20, budget: 600, color: "#06b6d4" },
  { category: "Entretenimiento", amount: 434, percentage: 15, budget: 500, color: "#10b981" },
  { category: "Servicios", amount: 723, percentage: 25, budget: 800, color: "#f59e0b" },
  { category: "Compras", amount: 289, percentage: 10, budget: 400, color: "#ef4444" },
]

const monthlyComparison = [
  { category: "Comida", current: 867, previous: 756 },
  { category: "Transporte", current: 578, previous: 623 },
  { category: "Entretenimiento", current: 434, previous: 389 },
  { category: "Servicios", current: 723, previous: 698 },
  { category: "Compras", current: 289, previous: 445 },
]

const creditDebitDetailed = [
  { name: "Crédito", value: 41.5, amount: 1200, color: "#f59e0b" },
  { name: "Débito", value: 58.5, amount: 1690, color: "#06b6d4" },
]

const unnecessaryByCategory = [
  { category: "Comida", amount: 89, items: ["Starbucks", "Restaurante caro"] },
  { category: "Entretenimiento", amount: 16, items: ["Netflix no usado"] },
  { category: "Compras", amount: 155, items: ["Ropa innecesaria", "Amazon impulso"] },
]

const topSpendingCategories = [
  { category: "Comida", amount: 867, rank: 1 },
  { category: "Servicios", amount: 723, rank: 2 },
  { category: "Transporte", amount: 578, rank: 3 },
  { category: "Entretenimiento", amount: 434, rank: 4 },
  { category: "Compras", amount: 289, rank: 5 },
]

export function Analytics() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-balance">Análisis Financiero</h1>
        <p className="text-muted-foreground">Análisis detallado de tus patrones de gasto</p>
      </div>

      {/* Category Breakdown */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Desglose por Categoría</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {categoryBreakdown.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{item.category}</span>
                <div className="text-right">
                  <span className="font-bold">${item.amount}</span>
                  <span className="text-sm text-muted-foreground ml-2">de ${item.budget}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Progress
                  value={(item.amount / item.budget) * 100}
                  className="flex-1"
                  style={
                    {
                      "--progress-background": item.color,
                    } as React.CSSProperties
                  }
                />
                <span className="text-sm font-medium w-12 text-right">{item.percentage}%</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{Math.round((item.amount / item.budget) * 100)}% del presupuesto</span>
                <span>${item.budget - item.amount} restante</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Comparison */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Comparación Mensual</CardTitle>
            <p className="text-sm text-muted-foreground">Mes actual vs anterior</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="previous" fill="hsl(var(--muted))" name="Mes Anterior" radius={[2, 2, 0, 0]} />
                <Bar dataKey="current" fill="hsl(var(--primary))" name="Mes Actual" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
                  data={creditDebitDetailed}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {creditDebitDetailed.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Porcentaje"]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {creditDebitDetailed.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${item.amount}</div>
                    <div className="text-sm text-muted-foreground">{item.value}%</div>
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
                <div className="text-2xl font-bold text-warning">$260</div>
                <div className="text-sm text-muted-foreground">Total Innecesario</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">9%</div>
                <div className="text-sm text-muted-foreground">Del Total</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Por Categoría:</h4>
              {unnecessaryByCategory.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{item.category}</span>
                    <span className="text-warning font-bold">${item.amount}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{item.items.join(", ")}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
              {topSpendingCategories.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-sm font-bold text-primary-foreground">
                    {item.rank}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.category}</div>
                    <div className="text-sm text-muted-foreground">
                      {((item.amount / 2891) * 100).toFixed(1)}% del total
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${item.amount}</div>
                    <div className="flex items-center gap-1 text-sm">
                      {index < 2 ? (
                        <TrendingUp className="w-3 h-3 text-destructive" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-success" />
                      )}
                      <span className={index < 2 ? "text-destructive" : "text-success"}>
                        {index < 2 ? "+" : "-"}
                        {Math.floor(Math.random() * 15) + 5}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
