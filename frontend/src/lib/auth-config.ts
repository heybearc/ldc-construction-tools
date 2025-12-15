import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import { logUserLogin, logUserLogout } from "./audit"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Find user in database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.passwordHash) {
          return null
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isPasswordValid) {
          return null
        }

        // Check if user is active
        if (user.status !== 'ACTIVE') {
          return null
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLogin: new Date(),
            loginCount: { increment: 1 }
          }
        })

        // Return user object for session
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          adminLevel: user.adminLevel,
          regionId: user.regionId,
          zoneId: user.zoneId,
        }
      }
    })
  ],

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },

  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },

  callbacks: {
    async jwt({ token, user }) {
      // Add user data to token on sign in
      if (user) {
        token.id = user.id
        token.role = user.role
        token.adminLevel = user.adminLevel
        token.regionId = user.regionId
        token.zoneId = user.zoneId
      }
      return token
    },

    async session({ session, token }) {
      // Add token data to session
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.adminLevel = token.adminLevel as string
        session.user.regionId = token.regionId as string
        session.user.zoneId = token.zoneId as string
      }
      return session
    }
  },

  events: {
    async signIn({ user }) {
      console.log(`NextAuth: User signed in: ${user.email}`)
      // Log to audit trail
      if (user.id && user.email) {
        await logUserLogin(user.id, user.email)
      }
    },
    async signOut({ token }) {
      console.log(`NextAuth: User signed out: ${token?.email}`)
      // Log to audit trail
      if (token?.id && token?.email) {
        await logUserLogout(token.id as string, token.email as string)
      }
    }
  },

  debug: process.env.NODE_ENV === 'development',
}
