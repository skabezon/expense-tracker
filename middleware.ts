import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Si no hay token y no es la ruta de autenticación, redirigir a /auth
    if (!token && !pathname.startsWith("/auth")) {
      return NextResponse.redirect(new URL("/auth", req.url))
    }

    // Si hay token, verificar que el usuario tenga acceso a la ruta
    if (token && token.sub) {
      // Obtener el userId del token
      const userId = token.sub

      // Agregar el userId como header para usar en las API routes
      const requestHeaders = new Headers(req.headers)
      requestHeaders.set("x-user-id", userId)

      // Permitir el acceso y pasar el userId
      return NextResponse.next({
        headers: requestHeaders
      })
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Si la ruta es /auth, permitir acceso sin token
        if (req.nextUrl.pathname.startsWith("/auth")) {
          return true
        }
        // Para todas las demás rutas, requerir token
        return !!token
      },
    },
    pages: {
      signIn: "/auth",
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (API routes de NextAuth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
}