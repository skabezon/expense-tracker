import { Loader2, Wallet } from "lucide-react"

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto">
            <Wallet className="w-10 h-10 text-primary-foreground" />
          </div>
          <Loader2 className="w-8 h-8 absolute -bottom-2 -right-2 animate-spin text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ExpenseTracker
          </h2>
          <p className="text-sm text-muted-foreground">Cargando tu cuenta...</p>
        </div>
      </div>
    </div>
  )
}