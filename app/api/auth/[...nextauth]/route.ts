import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { UserService } from '@/lib/services/userService'
import { UserSession } from '@/lib/types/user'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === 'google') {
          // Buscar o crear usuario en MongoDB
          await UserService.findOrCreateGoogleUser({
            id: account.providerAccountId,
            email: user.email!,
            name: user.name || user.email!,
            image: user.image || undefined,
          })
        }
        return true
      } catch (error) {
        console.error('Error en signIn:', error)
        return false
      }
    },

    async jwt({ token, account, user }) {
      // Agregar información adicional al token
      if (account && user) {
        const dbUser = await UserService.findByEmail(user.email!)
        if (dbUser) {
          token.userId = dbUser._id!.toString()
        }
      }
      return token
    },

    async session({ session, token }) {
      // Agregar información del usuario a la sesión
      if (session.user && token.userId) {
        const dbUser = await UserService.findById(token.userId as string)
        if (dbUser) {
          session.user = {
            ...session.user,
            id: dbUser._id!.toString(),
          } as UserSession & { id: string }
        }
      }
      return session
    },
  },

  pages: {
    signIn: '/auth',
    error: '/auth',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },

  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }