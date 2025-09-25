import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { findUserByEmail } from './db-direct'
import bcrypt from 'bcryptjs'

type UserRole = 'admin' | 'teacher' | 'student'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          console.log('🔐 NextAuth authorize called with:', {
            email: credentials?.email,
            hasPassword: !!credentials?.password
          })

          if (!credentials?.email || !credentials?.password) {
            console.log('❌ Missing credentials')
            return null
          }

          // Normalize email to lowercase for consistent lookup
          const normalizedEmail = credentials.email.toLowerCase().trim()
          console.log('📧 Normalized email:', normalizedEmail)

          const user = await findUserByEmail(normalizedEmail)

          if (!user) {
            console.log('❌ User not found for email:', normalizedEmail)
            return null
          }

          console.log('👤 User found:', { id: user.userId, email: user.email, role: user.role })

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          console.log('🔐 Password validation result:', isPasswordValid)

          if (!isPasswordValid) {
            console.log('❌ Invalid password for user:', normalizedEmail)
            return null
          }

          const authUser = {
            id: user.userId.toString(),
            email: user.email,
            name: user.fullName,
            role: user.role,
          }

          console.log('✅ Authentication successful for:', authUser.email)
          return authUser
        } catch (error) {
          console.error('❌ Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as UserRole
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error', // Custom error page
  },
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code, metadata) {
      console.error('NextAuth Error:', code, metadata)
    },
    warn(code) {
      console.warn('NextAuth Warning:', code)
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('NextAuth Debug:', code, metadata)
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}

declare module 'next-auth' {
  interface User {
    role: UserRole
  }
  
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
  }
}
