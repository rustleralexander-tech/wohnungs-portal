import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const { handlers: { GET, POST }, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req): Promise<{ id: string; email: string; name: string } | null> {
        if (credentials?.email === process.env.ADMIN_EMAIL &&
            credentials?.password === process.env.ADMIN_PASSWORD) {
          return {
            id: "1",
            email: String(credentials.email),
            name: "Administrator"
          }
        }
        return null
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
})
