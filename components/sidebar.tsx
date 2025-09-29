"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Receipt, BarChart3, Tags, Settings, Wallet } from "lucide-react"
import { UserMenu } from "@/components/user-menu"
import { Separator } from "@/components/ui/separator"

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navigation = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "transactions", label: "Transacciones", icon: Receipt },
  { id: "analytics", label: "Análisis", icon: BarChart3 },
  { id: "categories", label: "Categorías", icon: Tags },
  { id: "settings", label: "Configuración", icon: Settings },
]

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="w-64 glass border-r border-border/50 p-6 flex flex-col h-screen">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Wallet className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ExpenseTracker
          </h1>
          <p className="text-sm text-muted-foreground">Gestión inteligente</p>
        </div>
      </div>

      <nav className="space-y-2 flex-1">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-12 text-left transition-all duration-200",
                activeTab === item.id
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg"
                  : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground",
              )}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Button>
          )
        })}
      </nav>

      <div className="mt-auto">
        <Separator className="mb-4" />
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Mi cuenta</span>
          <UserMenu />
        </div>
      </div>
    </div>
  )
}