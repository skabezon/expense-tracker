"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, AlertTriangle, User, Calendar } from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"

const summaryData = [
  { title: "Ingresos Totales", value: "$3,450", change: "+12%", icon: TrendingUp, color: "text-success" },
  { title: "Gastos Totales", value: "$2,890", change: "+8%", icon: TrendingDown, color: "text-destructive" },
  { title: "Balance", value: "$560", change: "+4%", icon: DollarSign, color: "text-primary" },
  { title: "Tasa de Ahorro", value: "16.2%", change: "+2%", icon: PiggyBank, color: "text-accent" },
]

const expenseBreakdown = [
  { name: "Comida", value: 30, amount: 867, color: "#8b5cf6" },
  { name: "Transporte", value: 20, amount: 578, color: "#06b6d4" },
  { name: "Entretenimiento", value: 15, amount: 434, color: "#10b981" },
  { name: "Servicios", value: 25, amount: 723, color: "#f59e0b" },
  { name: "Compras", value: 10, amount: 289, color: "#ef4444" },
]

const creditDebitData = [
  { name: "Crédito", value: 1200, color: "#f59e0b" },
  { name: "Débito", value: 1690, color: "#06b6d4" },
]

const monthlyTrend = [
  { month: "Jul", amount: 2400 },
  { month: "Ago", amount: 2600 },
  { month: "Sep", amount: 2200 },
  { month: "Oct", amount: 2800 },
  { month: "Nov", amount: 2500 },
  { month: "Dic", amount: 2890 },
]

const unnecessaryExpenses = [
  { item: "Suscripción no utilizada", amount: 15 },
  { item: "Comida rápida excesiva", amount: 89 },
  { item: "Compras impulsivas", amount: 156 },
]

export function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Dashboard Financiero</h1>
          <p className="text-muted-foreground">Resumen de tu actividad financiera</p>
        </div>
        <div className="flex items-center gap-4">
          <Select defaultValue="diciembre">
            <SelectTrigger className="w-40 glass">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="diciembre">Diciembre 2024</SelectItem>
              <SelectItem value="noviembre">Noviembre 2024</SelectItem>
              <SelectItem value="octubre">Octubre 2024</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="glass bg-transparent">
            <User className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryData.map((item, index) => {
          const Icon = item.icon
          return (
            <Card key={index} className="glass glass-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
                <Icon className={`w-5 h-5 ${item.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={item.color}>{item.change}</span> desde el mes pasado
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown Pie Chart */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Distribución de Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Porcentaje"]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {expenseBreakdown.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                  <span className="text-sm font-medium ml-auto">${item.amount}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Credit vs Debit */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Crédito vs Débito</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={creditDebitData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {creditDebitData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-[#f59e0b] text-white">
                  Crédito
                </Badge>
                <span className="text-sm font-medium">$1,200</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-[#06b6d4] text-white">
                  Débito
                </Badge>
                <span className="text-sm font-medium">$1,690</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend */}
        <Card className="lg:col-span-2 glass">
          <CardHeader>
            <CardTitle>Tendencia de Gastos (6 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Unnecessary Expenses Alert */}
        <Card className="glass border-warning/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="w-5 h-5" />
              Gastos Innecesarios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {unnecessaryExpenses.map((expense, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{expense.item}</span>
                <span className="text-sm font-medium text-warning">${expense.amount}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between font-medium">
                <span>Total</span>
                <span className="text-warning">$260</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">9% de tus gastos totales</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
