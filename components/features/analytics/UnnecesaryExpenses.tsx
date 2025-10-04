'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import type { Transaction } from "@/lib/types/transactions"

interface Props {
  transactions: Transaction[]
}

export function UnnecessaryExpenses({ transactions }: Props) {
  const unnecessaryTransactions = transactions.filter(t => t.unnecessary)
  const totalUnnecessary = unnecessaryTransactions.reduce(
    (sum, t) => sum + Math.abs(t.amount),
    0
  )
  const totalExpenses = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const percentage = totalExpenses > 0 ? (totalUnnecessary / totalExpenses) * 100 : 0

  if (unnecessaryTransactions.length === 0) {
    return null
  }

  return (
    <Card className= "glass border-yellow-500/20" >
    <CardHeader>
    <CardTitle className="flex items-center gap-2" >
      <AlertTriangle className="w-5 h-5 text-yellow-500" />
        Gastos Innecesarios
          </CardTitle>
          </CardHeader>
          < CardContent >
          <div className="space-y-4" >
            <div className="flex items-center justify-between p-4 rounded-lg bg-yellow-500/10" >
              <div>
              <div className="text-sm text-muted-foreground" > Total en gastos innecesarios </div>
                < div className = "text-2xl font-bold text-yellow-500" >
                  ${ totalUnnecessary.toFixed(2) }
  </div>
    </div>
    < Badge variant = "outline" className = "border-yellow-500 text-yellow-500" >
      { percentage.toFixed(1) } % del total
        </Badge>
        </div>

        < div className = "space-y-2" >
          <div className="text-sm font-medium" > Detalles: </div>
  {
    unnecessaryTransactions.slice(0, 5).map((transaction) => (
      <div 
                key= { transaction._id?.toString() } 
                className = "flex justify-between items-center p-3 rounded-lg bg-card/50"
      >
      <div className="flex-1" >
    <div className="font-medium" > { transaction.description } </div>
    < div className = "text-sm text-muted-foreground" > { transaction.category } </div>
    </div>
    < div className = "text-right" >
    <div className="font-semibold text-yellow-500" >
    -${ Math.abs(transaction.amount).toFixed(2) }
    </div>
    < div className = "text-xs text-muted-foreground" >
    { new Date(transaction.date).toLocaleDateString('es') }
    </div>
    </div>
    </div>
    ))
  }
  {
    unnecessaryTransactions.length > 5 && (
      <div className="text-sm text-muted-foreground text-center pt-2" >
        Y { unnecessaryTransactions.length - 5 } más...
    </div>
            )
  }
  </div>
    </div>
    </CardContent>
    </Card>
  )
}