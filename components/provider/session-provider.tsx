"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"
import type React from "react"

interface SessionProviderProps {
  children: React.ReactNode
}

export function SessionProvider({ children }: SessionProviderProps) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}