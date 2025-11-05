import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  providers: [],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnProtectedRoute =
        nextUrl.pathname.startsWith('/dashboard') ||
        nextUrl.pathname.startsWith('/transactions') ||
        nextUrl.pathname.startsWith('/accounts') ||
        nextUrl.pathname.startsWith('/categories')

      if (isOnProtectedRoute && !isLoggedIn) {
        return false // Redirect to login page
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token, user }) {
      if (session.user) {
        session.user.id = (user?.id as string) || (token.id as string)
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
  },
} satisfies NextAuthConfig
