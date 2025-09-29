"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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

const categoriesData = [
  {
    name: "Comida",
    spent: 867,
    budget: 1000,
    transactions: 12,
    unnecessary: 89,
    color: "#8b5cf6",
    trend: "+12%",
  },
  {
    name: "Transporte",
    spent: 578,
    budget: 600,
    transactions: 8,
    unnecessary: 0,
    color: "#06b6d4",
    trend: "-5%",
  },
  {
    name: "Entretenimiento",
    spent: 434,
    budget: 500,
    transactions: 6,
    unnecessary: 16,
    color: "#10b981",
    trend: "+8%",
  },
  {
    name: "Servicios",
    spent: 723,
    budget: 800,
    transactions: 4,
    unnecessary: 0,
    color: "#f59e0b",
    trend: "+3%",
  },
  {
    name: "Compras",
    spent: 289,
    budget: 400,
    transactions: 5,
    unnecessary: 155,
    color: "#ef4444",
    trend: "-15%",
  },
  {
    name: "Salud",
    spent: 68,
    budget: 200,
    transactions: 2,
    unnecessary: 0,
    color: "#ec4899",
    trend: "+2%",
  },
  {
    name: "Educación",
    spent: 0,
    budget: 300,
    transactions: 0,
    unnecessary: 0,
    color: "#8b5cf6",
    trend: "0%",
  },
  {
    name: "Otros",
    spent: 45,
    budget: 100,
    transactions: 3,
    unnecessary: 0,
    color: "#6b7280",
    trend: "+25%",
  },
]

export function Categories() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-balance">Categorías</h1>
        <p className="text-muted-foreground">Análisis detallado por categoría de gasto</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">8</div>
              <div className="text-sm text-muted-foreground">Categorías Activas</div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-warning">$260</div>
              <div className="text-sm text-muted-foreground">Gastos Innecesarios</div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">72%</div>
              <div className="text-sm text-muted-foreground">Promedio de Presupuesto Usado</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categoriesData.map((category, index) => {
          const Icon = categoryIcons[category.name as keyof typeof categoryIcons]
          const percentage = (category.spent / category.budget) * 100
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
                    <span className="text-2xl font-bold">${category.spent}</span>
                    <Badge variant={category.trend.startsWith("+") ? "destructive" : "secondary"} className="text-xs">
                      {category.trend}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">de ${category.budget} presupuestado</div>
                </div>

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
                      <span className="text-destructive">Excedido por ${category.spent - category.budget}</span>
                    ) : (
                      <span>${category.budget - category.spent} restante</span>
                    )}
                  </div>
                </div>

                {hasUnnecessary && (
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-warning">Gastos innecesarios</span>
                      <span className="font-medium text-warning">${category.unnecessary}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {Math.round((category.unnecessary / category.spent) * 100)}% del total de la categoría
                    </div>
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
                const unnecessaryPercentage = (category.unnecessary / category.spent) * 100

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
                      <div className="font-bold text-warning">${category.unnecessary}</div>
                      <div className="text-sm text-muted-foreground">de ${category.spent} total</div>
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
