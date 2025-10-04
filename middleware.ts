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

    // ✅ YA NO AGREGAMOS x-user-id AL HEADER
    // El userId se obtendrá de getServerSession en cada API route

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith("/auth")) {
          return true
        }
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
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
}