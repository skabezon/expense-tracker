'use client'

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

interface Props {
  searchTerm: string
  onSearchChange: (value: string) => void
  categoryFilter: string
  onCategoryChange: (value: string) => void
  methodFilter: string
  onMethodChange: (value: string) => void
}

export function TransactionFilters({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  methodFilter,
  onMethodChange,
}: Props) {
  const categories = [
    "Todas",
    "Comida",
    "Transporte",
    "Entretenimiento",
    "Servicios",
    "Compras",
    "Salud",
    "Educación",
    "Otros",
  ]

  const methods = ["Todos", "Crédito", "Débito"]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar transacciones..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 glass"
        />
      </div>

      {/* Filtro por categoría */}
      <Select value={categoryFilter} onValueChange={onCategoryChange}>
        <SelectTrigger className="glass">
          <SelectValue placeholder="Todas las categorías" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filtro por método */}
      <Select value={methodFilter} onValueChange={onMethodChange}>
        <SelectTrigger className="glass">
          <SelectValue placeholder="Todos los métodos" />
        </SelectTrigger>
        <SelectContent>
          {methods.map((method) => (
            <SelectItem key={method} value={method}>
              {method}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}