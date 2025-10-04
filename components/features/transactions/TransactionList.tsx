'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import type { Transaction } from "@/lib/types/transactions"

interface Props {
  transactions: Transaction[]
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
}

export function TransactionList({ transactions, onEdit, onDelete }: Props) {
  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      Comida: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      Transporte: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
      Entretenimiento: 'bg-green-500/10 text-green-500 border-green-500/20',
      Servicios: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      Compras: 'bg-red-500/10 text-red-500 border-red-500/20',
      Salud: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
      Educación: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
      Otros: 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
    return colors[category] || colors.Otros
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay transacciones</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-4 font-medium">Fecha</th>
            <th className="text-left p-4 font-medium">Descripción</th>
            <th className="text-left p-4 font-medium">Categoría</th>
            <th className="text-left p-4 font-medium">Método</th>
            <th className="text-right p-4 font-medium">Monto</th>
            <th className="text-right p-4 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr 
              key={transaction._id?.toString()}
              className="border-b border-border hover:bg-card/50 transition-colors"
            >
              <td className="p-4">
                <span className="text-sm">
                  {new Date(transaction.date).toLocaleDateString('es')}
                </span>
              </td>
              <td className="p-4">
                <div className="space-y-1">
                  <p className="font-medium">{transaction.description}</p>
                  {transaction.unnecessary && (
                    <Badge variant="outline" className="text-xs border-yellow-500/50 text-yellow-500">
                      Innecesario
                    </Badge>
                  )}
                </div>
              </td>
              <td className="p-4">
                <Badge variant="outline" className={`${getCategoryColor(transaction.category)}`}>
                  {transaction.category}
                </Badge>
              </td>
              <td className="p-4">
                <span className="text-sm text-muted-foreground">
                  {transaction.method}
                </span>
              </td>
              <td className="p-4 text-right">
                <span className="font-semibold text-red-500">
                  -${Math.abs(transaction.amount).toFixed(2)}
                </span>
              </td>
              <td className="p-4">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(transaction)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(transaction._id?.toString() || '')}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}