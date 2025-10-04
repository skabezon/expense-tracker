"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useTransactions } from "@/hooks/useTransaction" 
import { TransactionList } from "./features/transactions/TransactionList"
import { TransactionFilters } from "./features/transactions/TransactionFilters"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import type { Transaction } from "@/lib/types/transactions"

export function Transactions() {
  const { transactions, loading, createTransaction, updateTransaction, deleteTransaction } = useTransactions()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("Todas")
  const [methodFilter, setMethodFilter] = useState("Todos")
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  
  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split('T')[0],
    description: "",
    amount: "",
    category: "Comida",
    method: "Débito",
    unnecessary: false,
  })

  // Filtrar transacciones
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "Todas" || t.category === categoryFilter
    const matchesMethod = methodFilter === "Todos" || t.method === methodFilter
    return matchesSearch && matchesCategory && matchesMethod
  })

  const handleAdd = async () => {
    if (!newTransaction.description || !newTransaction.amount) {
      toast.error("Por favor completa todos los campos")
      return
    }

    try {
      await createTransaction({
        ...newTransaction,
        amount: parseFloat(newTransaction.amount),
        date: new Date(newTransaction.date).toISOString(),
      })
      
      toast.success("Transacción creada exitosamente")
      setIsAddModalOpen(false)
      resetForm()
    } catch (error) {
      toast.error("Error al crear transacción")
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setNewTransaction({
      date: new Date(transaction.date).toISOString().split('T')[0],
      description: transaction.description,
      amount: Math.abs(transaction.amount).toString(),
      category: transaction.category,
      method: transaction.method,
      unnecessary: transaction.unnecessary || false,
    })
    setIsEditModalOpen(true)
  }

  const handleUpdate = async () => {
    if (!editingTransaction || !newTransaction.description || !newTransaction.amount) {
      toast.error("Por favor completa todos los campos")
      return
    }

    try {
      await updateTransaction(editingTransaction._id!.toString(), {
        ...newTransaction,
        amount: parseFloat(newTransaction.amount),
        date: new Date(newTransaction.date).toISOString(),
      })
      
      toast.success("Transacción actualizada exitosamente")
      setIsEditModalOpen(false)
      resetForm()
    } catch (error) {
      toast.error("Error al actualizar transacción")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta transacción?")) return

    try {
      await deleteTransaction(id)
      toast.success("Transacción eliminada exitosamente")
    } catch (error) {
      toast.error("Error al eliminar transacción")
    }
  }

  const resetForm = () => {
    setNewTransaction({
      date: new Date().toISOString().split('T')[0],
      description: "",
      amount: "",
      category: "Comida",
      method: "Débito",
      unnecessary: false,
    })
    setEditingTransaction(null)
  }

  const renderForm = () => (
    <div className="grid gap-4">
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
      <div>
        <Label htmlFor="description">Descripción</Label>
        <Input
          id="description"
          value={newTransaction.description}
          onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
          placeholder="Ej: Almuerzo en restaurante"
          className="glass"
        />
      </div>
      <div>
        <Label htmlFor="amount">Monto</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={newTransaction.amount}
          onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
          placeholder="0.00"
          className="glass"
        />
      </div>
      <div>
        <Label htmlFor="category">Categoría</Label>
        <Select value={newTransaction.category} onValueChange={(value) => setNewTransaction({ ...newTransaction, category: value })}>
          <SelectTrigger className="glass">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Comida">Comida</SelectItem>
            <SelectItem value="Transporte">Transporte</SelectItem>
            <SelectItem value="Entretenimiento">Entretenimiento</SelectItem>
            <SelectItem value="Servicios">Servicios</SelectItem>
            <SelectItem value="Compras">Compras</SelectItem>
            <SelectItem value="Salud">Salud</SelectItem>
            <SelectItem value="Educación">Educación</SelectItem>
            <SelectItem value="Otros">Otros</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="method">Método de Pago</Label>
        <Select value={newTransaction.method} onValueChange={(value) => setNewTransaction({ ...newTransaction, method: value })}>
          <SelectTrigger className="glass">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Crédito">Crédito</SelectItem>
            <SelectItem value="Débito">Débito</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          id="unnecessary"
          checked={newTransaction.unnecessary}
          onCheckedChange={(checked) => setNewTransaction({ ...newTransaction, unnecessary: checked })}
        />
        <Label htmlFor="unnecessary">Gasto innecesario</Label>
      </div>
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transacciones</h1>
        <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nueva Transacción
        </Button>
      </div>

      {/* Filtros */}
      <TransactionFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        methodFilter={methodFilter}
        onMethodChange={setMethodFilter}
      />

      {/* Lista de transacciones */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>
            {filteredTransactions.length} transacción(es)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Cargando...</div>
          ) : (
            <TransactionList
              transactions={filteredTransactions}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      {/* Modal agregar */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Transacción</DialogTitle>
          </DialogHeader>
          {renderForm()}
          <Button onClick={handleAdd} className="w-full">
            Agregar Transacción
          </Button>
        </DialogContent>
      </Dialog>

      {/* Modal editar */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Transacción</DialogTitle>
          </DialogHeader>
          {renderForm()}
          <Button onClick={handleUpdate} className="w-full">
            Guardar Cambios
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}