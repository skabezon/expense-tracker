'use client'

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
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react"

interface CategoryData {
  name: string
  spent: number
  budget: number
  transactions: number
  unnecessary: number
  color: string
  trend: string
}

interface Props {
  category: CategoryData
}

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

export function CategoryCard({ category }: Props) {
  const Icon = categoryIcons[category.name as keyof typeof categoryIcons] || MoreHorizontal
  const percentage = category.budget > 0 ? (category.spent / category.budget) * 100 : 0
  const isOverBudget = percentage > 100
  const trendValue = parseFloat(category.trend)
  const isPositiveTrend = trendValue > 0

  return (
    <Card className="glass hover:border-primary/50 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <Icon className="w-4 h-4" style={{ color: category.color }} />
          </div>
          {category.name}
        </CardTitle>
        <Badge variant={isOverBudget ? "destructive" : "outline"} className="text-xs">
          {percentage.toFixed(0)}%
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Progreso */}
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-muted-foreground">Gastado</span>
            <span className="font-semibold">${category.spent.toFixed(2)}</span>
          </div>
          <Progress 
            value={Math.min(percentage, 100)} 
            className="h-2"
            indicatorClassName={isOverBudget ? 'bg-destructive' : ''}
          />
          <div className="flex justify-between text-xs mt-1 text-muted-foreground">
            <span>{category.transactions} transacciones</span>
            <span>Presupuesto: ${category.budget.toFixed(2)}</span>
          </div>
        </div>

        {/* Estadísticas adicionales */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1 text-xs">
            {isPositiveTrend ? (
              <TrendingUp className="w-3 h-3 text-red-500" />
            ) : (
              <TrendingDown className="w-3 h-3 text-green-500" />
            )}
            <span className={isPositiveTrend ? 'text-red-500' : 'text-green-500'}>
              {category.trend}
            </span>
            <span className="text-muted-foreground">vs mes anterior</span>
          </div>
        </div>

        {/* Gastos innecesarios */}
        {category.unnecessary > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <AlertTriangle className="w-3 h-3 text-yellow-500" />
            <span className="text-xs text-yellow-500">
              ${category.unnecessary.toFixed(2)} innecesarios
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}