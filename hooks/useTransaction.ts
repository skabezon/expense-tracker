'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Transaction } from '@/lib/types/transactions'

interface UseTransactionsResult {
  transactions: Transaction[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createTransaction: (data: any) => Promise<Transaction>
  updateTransaction: (id: string, data: any) => Promise<Transaction>
  deleteTransaction: (id: string) => Promise<void>
}

export function useTransactions(): UseTransactionsResult {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/transactions')

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al cargar transacciones')
      }

      const result = await response.json()
      setTransactions(result.success ? result.data : result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar transacciones'
      setError(errorMessage)
      console.error('[useTransactions] Error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createTransaction = useCallback(async (data: any): Promise<Transaction> => {
    setError(null)

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear transacción')
      }

      const result = await response.json()
      await fetchTransactions()
      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear transacción'
      setError(errorMessage)
      throw err
    }
  }, [fetchTransactions])

  const updateTransaction = useCallback(
    async (id: string, data: any): Promise<Transaction> => {
      setError(null)

      try {
        const response = await fetch(`/api/transactions/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al actualizar transacción')
        }

        const result = await response.json()

        // Actualizar en el estado local
        setTransactions((prev) =>
          prev.map((t) => (t._id?.toString() === id ? result.data : t))
        )

        return result.data
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al actualizar transacción'
        setError(errorMessage)
        throw err
      }
    },
    []
  )

  const deleteTransaction = useCallback(async (id: string): Promise<void> => {
    setError(null)

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar transacción')
      }

      // Actualizar estado local
      setTransactions((prev) => prev.filter((t) => t._id?.toString() !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar transacción'
      setError(errorMessage)
      throw err
    }
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  }
}