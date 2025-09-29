"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Sidebar } from "./sidebar"
import { Dashboard } from "./dashboard"
import { Transactions } from "./transactions"
import { Analytics } from "./analytics"
import { Categories } from "./categories"
import { Settings } from "./settings"
import { LoadingScreen } from "./loading-screen"

export function ExpenseTracker() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const { data: session, status } = useSession()

  // Mostrar loading mientras verifica la sesión
  if (status === "loading") {
    return <LoadingScreen />
  }

  // Si no hay sesión, el middleware redirigirá a /auth
  if (!session) {
    return <LoadingScreen />
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />
      case "transactions":
        return <Transactions />
      case "analytics":
        return <Analytics />
      case "categories":
        return <Categories />
      case "settings":
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-auto">{renderContent()}</main>
    </div>
  )
}