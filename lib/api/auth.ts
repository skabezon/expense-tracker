import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export interface AuthenticatedUser {
  id: string
  email: string
  name?: string
  image?: string
}

/**
 * ✅ MÉTODO SEGURO - Obtener usuario autenticado
 * Usa getServerSession que verifica el JWT del lado del servidor
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    throw new Error('No authenticated')
  }

  const user: AuthenticatedUser = {
    id: (session.user as any).id || session.user.email,
    email: session.user.email,
    name: session.user.name || undefined,
    image: session.user.image || undefined,
  }

  return user
}

/**
 * Verificar si hay sesión válida
 */
export async function hasValidSession(): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions)
    return !!session?.user?.email
  } catch {
    return false
  }
}

/**
 * Obtener el ID del usuario de forma segura
 */
export async function getUserId(): Promise<string> {
  const user = await getAuthenticatedUser()
  return user.id
}