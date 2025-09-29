import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

// 👇 importa tu provider
import { SessionProvider } from "@/components/provider/session-provider"
export const metadata: Metadata = {
  title: "ExpenseTracker - Gestión Inteligente de Gastos",
  description: "Dashboard moderno para el seguimiento y análisis de gastos personales",
  generator: "jocha-expense-tracker",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <SessionProvider>  {/* ✅ Agrega el provider aquí */}
          <Suspense fallback={null}>{children}</Suspense>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  )
}
