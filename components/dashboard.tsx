"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useDashboard } from "@/hooks/useDashboard"
import { StatsCards } from "./features/dashboard/StatsCards"
import { ExpenseChart } from "./features/dashboard/ExpenseChart"
import { RecentTransactions } from "./features/dashboard/RecentTransactions"
import { Loader2 } from "lucide-react"

const months = [
  { value: "1", label: "Enero" },
  { value: "2", label: "Febrero" },
  { value: "3", label: "Marzo" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Mayo" },
  { value: "6", label: "Junio" },
  { value: "7", label: "Julio" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
]

export function Dashboard() {
  const today = new Date()
  const [selectedYear, setSelectedYear] = useState(today.getFullYear().toString())
  const [selectedMonth, setSelectedMonth] = useState((today.getMonth() + 1).toString())

  const { data, loading, error, refetch } = useDashboard(selectedYear, selectedMonth)

  const handleYearChange = (year: string) => {
    setSelectedYear(year)
    refetch(year, selectedMonth)
  }

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month)
    refetch(selectedYear, month)
  }

  const years = Array.from(
    { length: 5 },
    (_, i) => (today.getFullYear() - 2 + i).toString()
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-500 font-semibold">Error al cargar el dashboard</p>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="year-select">Año:</Label>
            <Select value={selectedYear} onValueChange={handleYearChange}>
              <SelectTrigger id="year-select" className="w-[100px] glass">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="month-select">Mes:</Label>
            <Select value={selectedMonth} onValueChange={handleMonthChange}>
              <SelectTrigger id="month-select" className="w-[140px] glass">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <StatsCards 
        income={data.income}
        expenses={data.expenses}
        saving={data.saving}
      />

      {/* Gráficos */}
      <ExpenseChart transactions={data.transactions} />

      {/* Transacciones recientes */}
      <RecentTransactions transactions={data.transactions} />
    </div>
  )
}