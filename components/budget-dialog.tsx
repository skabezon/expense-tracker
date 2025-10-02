"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { CategoryBudget } from "@/lib/services/budgetService"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface BudgetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  yearMonth: string
  currentBudgets: CategoryBudget[]
  onBudgetsUpdate: (budgets: CategoryBudget[]) => void
}

const DEFAULT_CATEGORIES = [
  "Comida",
  "Transporte",
  "Entretenimiento",
  "Servicios",
  "Compras",
  "Salud",
  "Educación",
  "Otros",
]

export function BudgetDialog({
  open,
  onOpenChange,
  yearMonth,
  currentBudgets,
  onBudgetsUpdate,
}: BudgetDialogProps) {
  const [budgets, setBudgets] = useState<CategoryBudget[]>(() =>
    DEFAULT_CATEGORIES.map((category) => ({
      category,
      amount: currentBudgets.find((b) => b.category === category)?.amount || 0,
    }))
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          yearMonth,
          budgets: budgets.map((b) => ({
            category: b.category,
            amount: Number(b.amount),
          })),
        }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar presupuestos")
      }

      onBudgetsUpdate(budgets)
      toast.success("Presupuestos actualizados correctamente")
      onOpenChange(false)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al actualizar presupuestos")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAmountChange = (category: string, value: string) => {
    setBudgets((prev) =>
      prev.map((b) =>
        b.category === category ? { ...b, amount: value ? Number(value) : 0 } : b
      )
    )
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("es-CO").format(amount)
  }

  const parseAmount = (value: string) => {
    return value.replace(/[^0-9]/g, "")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Configurar Presupuestos</DialogTitle>
            <DialogDescription>
              Establece el presupuesto mensual para cada categoría
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {budgets.map((budget) => (
              <div
                key={budget.category}
                className="grid grid-cols-3 items-center gap-4"
              >
                <Label htmlFor={budget.category}>{budget.category}</Label>
                <div className="col-span-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id={budget.category}
                      value={formatAmount(budget.amount)}
                      onChange={(e) =>
                        handleAmountChange(
                          budget.category,
                          parseAmount(e.target.value)
                        )
                      }
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}