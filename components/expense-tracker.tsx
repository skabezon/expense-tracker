"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Dashboard } from "./dashboard"
import { Transactions } from "./transactions"
import { Analytics } from "./analytics"
import { Categories } from "./categories"
import { Settings } from "./settings"

export function ExpenseTracker() {
  const [activeTab, setActiveTab] = useState("dashboard")

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
