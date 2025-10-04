'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Transaction } from '@/lib/types/transactions'

interface DashboardData {
  income: number
  saving: number
  expenses: number
  transactions: Transaction[]
}

interface UseDashboardResult {
  data: DashboardData | null
  loading: boolean
  error: string | null
  refetch: (year: string, month: string) => Promise<void>
}

export function useDashboard(
  initialYear?: string,
  initialMonth?: string
): UseDashboardResult {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = useCallback(async (year: string, month: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/dashboard?year=${year}&month=${month}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al cargar dashboard')
      }

      const result = await response.json()
      setData(result.success ? result.data : result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar dashboard'
      setError(errorMessage)
      console.error('[useDashboard] Error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const today = new Date()
    const year = initialYear || today.getFullYear().toString()
    const month = initialMonth || (today.getMonth() + 1).toString()

    fetchDashboard(year, month)
  }, [initialYear, initialMonth, fetchDashboard])

  return {
    data,
    loading,
    error,
    refetch: fetchDashboard,
  }
}