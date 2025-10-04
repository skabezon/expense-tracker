"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { useTransactions } from "@/hooks/useTransaction" 
import { useBudgets } from "@/hooks/useBudgets"
import { CategoryStats } from "./features/categories/CategoryStats"
import { CategoryList } from "./features/categories/CategoryList"
import { BudgetDialog } from "./budget-dialog"

export function Categories() {
  const { transactions } = useTransactions()
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  })
  const { budgets, refetch } = useBudgets(selectedMonth)
  const [showBudgetDialog, setShowBudgetDialog] = useState(false)

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

  const handleBudgetSaved = () => {
    refetch(selectedMonth)
    setShowBudgetDialog(false)
  }

  const monthlyTransactions = getMonthlyTransactions()
  const availableMonths = getAvailableMonths()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categorías</h1>
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
          <Button 
            onClick={() => setShowBudgetDialog(true)} 
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            Configurar Presupuestos
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <CategoryStats transactions={monthlyTransactions} budgets={budgets} />

      {/* Lista de categorías */}
      <CategoryList 
        transactions={monthlyTransactions} 
        budgets={budgets}
        selectedMonth={selectedMonth}
      />

      {/* Diálogo de presupuestos */}
      <BudgetDialog
        open={showBudgetDialog}
        onOpenChange={setShowBudgetDialog}
        selectedMonth={selectedMonth}
        currentBudgets={budgets}
        onSave={handleBudgetSaved}
      />
    </div>
  )
}