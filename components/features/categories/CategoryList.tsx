'use client'

import { CategoryCard } from './CategoryCard'
import type { Transaction } from '@/lib/types/transactions'
import type { CategoryBudget } from '@/lib/services/budgetService'

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
  transactions: Transaction[]
  budgets: CategoryBudget[]
  selectedMonth: string
}

export function CategoryList({ transactions, budgets, selectedMonth }: Props) {
  const getCategoryData = (): CategoryData[] => {
    const categories = Array.from(new Set(transactions.map(t => t.category)))
    const [year, month] = selectedMonth.split('-')

    return categories.map(name => {
      const categoryTransactions = transactions.filter(t => t.category === name)
      const spent = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
      const unnecessary = categoryTransactions
        .filter(t => t.unnecessary)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      // Calcular tendencia comparando con mes anterior
      const prevMonth = parseInt(month) === 1 ? 12 : parseInt(month) - 1
      const prevYear = parseInt(month) === 1 ? parseInt(year) - 1 : parseInt(year)
      const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}`
      
      const prevTransactions = transactions.filter(t => 
        t.date.startsWith(prevMonthStr) && t.category === name
      )
      const prevSpent = prevTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
      
      let trend = '0%'
      if (prevSpent > 0) {
        const trendValue = ((spent - prevSpent) / prevSpent) * 100
        trend = `${trendValue > 0 ? '+' : ''}${trendValue.toFixed(0)}%`
      } else if (spent > 0) {
        trend = '+100%'
      }

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
    }).sort((a, b) => b.spent - a.spent)
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

  if (categoriesData.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No hay categorías con transacciones en este mes
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {categoriesData.map((category) => (
        <CategoryCard key={category.name} category={category} />
      ))}
    </div>
  )
}