'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CategoryBudget } from '@/lib/services/budgetService'

interface UseBudgetsResult {
  budgets: CategoryBudget[]
  loading: boolean
  error: string | null
  refetch: (yearMonth: string) => Promise<void>
  saveBudgets: (yearMonth: string, budgets: CategoryBudget[]) => Promise<void>
}

export function useBudgets(initialYearMonth?: string): UseBudgetsResult {
  const [budgets, setBudgets] = useState<CategoryBudget[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentYearMonth, setCurrentYearMonth] = useState(
    initialYearMonth || (() => {
      const today = new Date()
      return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
    })()
  )

  const fetchBudgets = useCallback(async (yearMonth: string) => {
    setLoading(true)
    setError(null)
    setCurrentYearMonth(yearMonth)

    try {
      const response = await fetch(`/api/budgets?yearMonth=${yearMonth}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al cargar presupuestos')
      }

      const result = await response.json()
      setBudgets(result.success ? result.data : result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar presupuestos'
      setError(errorMessage)
      console.error('[useBudgets] Error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const saveBudgets = useCallback(
    async (yearMonth: string, budgetsData: CategoryBudget[]): Promise<void> => {
      setError(null)

      try {
        const response = await fetch('/api/budgets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ yearMonth, budgets: budgetsData }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al guardar presupuestos')
        }

        // Refetch después de guardar
        await fetchBudgets(yearMonth)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al guardar presupuestos'
        setError(errorMessage)
        throw err
      }
    },
    [fetchBudgets]
  )

  useEffect(() => {
    fetchBudgets(currentYearMonth)
  }, [currentYearMonth, fetchBudgets])

  return {
    budgets,
    loading,
    error,
    refetch: fetchBudgets,
    saveBudgets,
  }
}