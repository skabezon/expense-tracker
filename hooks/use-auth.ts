import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const login = async () => {
    await signIn("google", { callbackUrl: "/" })
  }

  const logout = async () => {
    await signOut({ callbackUrl: "/auth" })
  }

  const isAuthenticated = status === "authenticated"
  const isLoading = status === "loading"

  return {
    session,
    user: session?.user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  }
}