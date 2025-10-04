'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import type { Transaction } from "@/lib/types/transactions"

interface Props {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: Props) {
  const recentTransactions = transactions.slice(0, 5)

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

  if (recentTransactions.length === 0) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle>Transacciones Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No hay transacciones recientes
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Transacciones Recientes</CardTitle>
        <Link 
          href="/transactions" 
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          Ver todas
          <ArrowRight className="w-4 h-4" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentTransactions.map((transaction) => (
            <div
              key={transaction._id?.toString()}
              className="flex items-center justify-between p-4 rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{transaction.description}</p>
                  {transaction.unnecessary && (
                    <Badge variant="outline" className="text-xs border-yellow-500/50 text-yellow-500">
                      Innecesario
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className={`text-xs ${getCategoryColor(transaction.category)}`}>
                    {transaction.category}
                  </Badge>
                  <span>•</span>
                  <span>{new Date(transaction.date).toLocaleDateString('es')}</span>
                  <span>•</span>
                  <span>{transaction.method}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-red-500">
                  -${Math.abs(transaction.amount).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}