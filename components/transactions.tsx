"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Edit, Trash2, CreditCard, Banknote } from "lucide-react"
import type { Transaction } from "@/lib/types/transactions"
import type { TransactionFormData } from "@/lib/types/transactionFormData" 
import { LoadingScreen } from "@/components/loading-screen"

const categories = ["Comida", "Transporte", "Entretenimiento", "Servicios", "Compras", "Salud", "Educación", "Otros"]

export function Transactions() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeMonth, setActiveMonth] = useState(() => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}` // YYYY-MM format
  })
  const [newTransaction, setNewTransaction] = useState<TransactionFormData>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: '',
    amount: '',
    method: 'Débito',
    unnecessary: false,
    tags: ''
  })

  const getAvailableMonths = () => {
    const months = new Set(transactions.map(t => {
      const date = new Date(t.date)
            console.log("🚀 ~ getAvailableMonths ~ date:", date)

      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    }))
    return Array.from(months).sort().reverse() // Newest first
  }

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const date = new Date(Number(year), Number(month) - 1, 1)
    return new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric' }).format(date)
  }

  // Función para manejar la edición
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setNewTransaction({
      date: transaction.date,
      description: transaction.description,
      category: transaction.category,
      amount: String(transaction.amount),
      method: transaction.method,
      unnecessary: transaction.unnecessary,
      tags: transaction.tags || ''
    })
    setIsEditModalOpen(true)
  }

  // Función para guardar la edición
  const handleSaveEdit = async () => {
    if (!editingTransaction) return

    try {
      const response = await fetch(`/api/transactions/${editingTransaction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newTransaction,
          amount: Number(newTransaction.amount)
        })
      })

      if (!response.ok) throw new Error('Error al editar transacción')
      const updatedTransaction = await response.json()

      setTransactions(transactions.map(t => 
        t.id === editingTransaction.id ? {
          ...updatedTransaction,
          id: updatedTransaction._id,
          date: new Date(updatedTransaction.date).toISOString().split('T')[0]
        } : t
      ))
      setIsEditModalOpen(false)
      setEditingTransaction(null)
      setNewTransaction({
        date: '',
        description: '',
        category: '',
        amount: '0',
        method: 'Débito',
        unnecessary: false,
        tags: ''
      })
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // Función para eliminar una transacción
  const handleDelete = async (id: string | number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta transacción?')) return

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Error al eliminar transacción')
      setTransactions(transactions.filter(t => t.id !== id))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // Cargar transacciones de la API
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/transactions')
        if (!response.ok) throw new Error('Error al cargar transacciones')
        const data = await response.json()
        // Convertir los datos de la API al formato de la interfaz actual
        const formattedData = data.map((t: any): Transaction => {
          const date = new Date(t.date)
          // Asegurarnos de que la fecha esté en la zona horaria local
          date.setMinutes(date.getMinutes() + date.getTimezoneOffset())
          return {
            id: t._id,
            date: date.toISOString().split('T')[0],
            description: t.description,
            category: t.category,
            amount: t.amount,
            method: t.method,
            unnecessary: t.unnecessary,
            tags: t.tags || ''
          }
        })
        setTransactions(formattedData)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesMonth = transaction.date.startsWith(activeMonth)

    switch (filter) {
      case "credit":
        return matchesSearch && matchesMonth && transaction.method === "Crédito"
      case "debit":
        return matchesSearch && matchesMonth && transaction.method === "Débito"
      case "unnecessary":
        return matchesSearch && matchesMonth && transaction.unnecessary
      default:
        return matchesSearch && matchesMonth
    }
  })

  const handleAddTransaction = async () => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newTransaction,
          amount: Number(newTransaction.amount)
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear transacción')
      }

      const data = await response.json()
      
      setTransactions(prev => [...prev, {
        ...data,
        id: data._id,
        date: new Date(data.date).toISOString().split('T')[0]
      }])
      
      setIsAddModalOpen(false)
      setNewTransaction({
        date: new Date().toISOString().split('T')[0],
        description: '',
        category: '',
        amount: '',
        method: 'Débito',
        unnecessary: false,
        tags: ''
      })
    } catch (error) {
      console.error('Error:', error)
      alert(error instanceof Error ? error.message : 'Error al crear transacción')
    }
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Transacciones</h1>
          <p className="text-muted-foreground">Gestiona y revisa todas tus transacciones</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Transacción
            </Button>
          </DialogTrigger>
          <DialogContent className="glass">
            <DialogHeader>
              <DialogTitle>Nueva Transacción</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Monto</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                  className="glass"
                />
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  placeholder="Descripción de la transacción"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  className="glass"
                />
              </div>
              <div>
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={newTransaction.category}
                  onValueChange={(value) => setNewTransaction({ ...newTransaction, category: value })}
                >
                  <SelectTrigger className="glass">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                  className="glass"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="method"
                  checked={newTransaction.method === "Crédito"}
                  onCheckedChange={(checked) =>
                    setNewTransaction({ ...newTransaction, method: checked ? "Crédito" : "Débito" })
                  }
                />
                <Label htmlFor="method">{newTransaction.method}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="unnecessary"
                  checked={newTransaction.unnecessary}
                  onCheckedChange={(checked) => setNewTransaction({ ...newTransaction, unnecessary: !!checked })}
                />
                <Label htmlFor="unnecessary">Marcar como innecesario</Label>
              </div>
              <div>
                <Label htmlFor="tags">Etiquetas (opcional)</Label>
                <Input
                  id="tags"
                  placeholder="trabajo, personal, urgente..."
                  value={newTransaction.tags}
                  onChange={(e) => setNewTransaction({ ...newTransaction, tags: e.target.value })}
                  className="glass"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleAddTransaction} className="flex-1 bg-gradient-to-r from-primary to-accent">
                  Guardar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card className="glass">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar transacciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass"
              />
            </div>
            <div className="flex gap-2">
              <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")} size="sm">
                Todas
              </Button>
              <Button
                variant={filter === "credit" ? "default" : "outline"}
                onClick={() => setFilter("credit")}
                size="sm"
              >
                Solo Crédito
              </Button>
              <Button variant={filter === "debit" ? "default" : "outline"} onClick={() => setFilter("debit")} size="sm">
                Solo Débito
              </Button>
              <Button
                variant={filter === "unnecessary" ? "default" : "outline"}
                onClick={() => setFilter("unnecessary")}
                size="sm"
              >
                Innecesarios
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Historial de Transacciones</CardTitle>
        </CardHeader>
        <Tabs defaultValue={activeMonth} onValueChange={setActiveMonth} className="w-full">
          <TabsList className="ml-6">
            {getAvailableMonths().map((month) => (
              <TabsTrigger key={month} value={month} className="min-w-[140px]">
                {formatMonth(month)}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={activeMonth}>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-medium text-muted-foreground">Fecha</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Descripción</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Categoría</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Etiquetas</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Monto</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">Método</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">Estado</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-b border-border/50 hover:bg-secondary/20 transition-colors"
                      >
                        <td className="p-3 text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString("es-ES")}
                        </td>
                        <td className="p-3 font-medium">{transaction.description}</td>
                        <td className="p-3">
                          <Badge variant="secondary" className="glass">
                            {transaction.category}
                          </Badge>
                        </td>
                        <td className="p-3">
                          {transaction.tags?.split(',').map((tag, index) => (
                            tag.trim() && <Badge key={index} variant="outline" className="mr-1">{tag.trim()}</Badge>
                          ))}
                        </td>
                        <td
                          className={`p-3 text-right font-medium ${transaction.amount > 0 ? "text-success" : "text-foreground"}`}
                        >
                          {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                        </td>
                        <td className="p-3 text-center">
                          <Badge
                            variant="secondary"
                            className={
                              transaction.method === "Crédito" ? "bg-[#f59e0b] text-white" : "bg-[#06b6d4] text-white"
                            }
                          >
                            {transaction.method === "Crédito" ? (
                              <>
                                <CreditCard className="w-3 h-3 mr-1" />
                                Crédito
                              </>
                            ) : (
                              <>
                                <Banknote className="w-3 h-3 mr-1" />
                                Débito
                              </>
                            )}
                          </Badge>
                        </td>
                        <td className="p-3 text-center">
                          {transaction.unnecessary && (
                            <Badge variant="destructive" className="text-xs">
                              Innecesario
                            </Badge>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleEdit(transaction)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(transaction.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Mostrando {filteredTransactions.length} de {transactions.length} transacciones
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Anterior
                  </Button>
                  <Button variant="outline" size="sm">
                    1
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Siguiente
                  </Button>
                </div>
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Transacción</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="edit-date">Fecha</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                  className="glass"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Descripción</Label>
                <Input
                  id="edit-description"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  className="glass"
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Categoría</Label>
                <Select
                  value={newTransaction.category}
                  onValueChange={(value) => setNewTransaction({ ...newTransaction, category: value })}
                >
                  <SelectTrigger id="edit-category" className="glass">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-amount">Monto</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                  className="glass"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-method"
                  checked={newTransaction.method === "Crédito"}
                  onCheckedChange={(checked) =>
                    setNewTransaction({ ...newTransaction, method: checked ? "Crédito" : "Débito" })
                  }
                />
                <Label htmlFor="edit-method">{newTransaction.method}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-unnecessary"
                  checked={newTransaction.unnecessary}
                  onCheckedChange={(checked) => setNewTransaction({ ...newTransaction, unnecessary: !!checked })}
                />
                <Label htmlFor="edit-unnecessary">Marcar como innecesario</Label>
              </div>
              <div>
                <Label htmlFor="edit-tags">Etiquetas (opcional)</Label>
                <Input
                  id="edit-tags"
                  placeholder="trabajo, personal, urgente..."
                  value={newTransaction.tags}
                  onChange={(e) => setNewTransaction({ ...newTransaction, tags: e.target.value })}
                  className="glass"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleSaveEdit} className="flex-1 bg-gradient-to-r from-primary to-accent">
                  Guardar
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}