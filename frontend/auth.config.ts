import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';
import bcrypt from 'bcryptjs';

// User type for authentication
interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  regionId: string;
  zoneId: string;
}

export const authConfig: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials): Promise<AuthUser | null> {
        if (!credentials?.email || !credentials?.password) {
          console.log('NextAuth: Missing credentials');
          return null;
        }

        try {
          console.log('NextAuth: Attempting to authenticate user:', credentials.email);
          
          // Call our backend API to authenticate user
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            }),
          });

          if (!response.ok) {
            console.log('NextAuth: Authentication failed - invalid credentials');
            return null;
          }

          const userData = await response.json();
          
          if (!userData || !userData.user) {
            console.log('NextAuth: No user data returned from backend');
            return null;
          }

          const user = userData.user;
          
          console.log('NextAuth: Authentication successful for:', user.email);
          
          return {
            id: user.id,
            email: user.email,
            name: `${user.first_name} ${user.last_name}`,
            role: user.role,
            regionId: user.region_id,
            zoneId: user.zone_id
          };

        } catch (error) {
          console.error('NextAuth: Authentication error:', error);
          
          // Fallback for development - remove in production
          if (process.env.NODE_ENV === 'development' && 
              credentials.email === 'admin@ldc-construction.local' && 
              credentials.password === 'AdminPass123!') {
            console.log('NextAuth: Using development fallback authentication');
            return {
              id: 'dev-admin-id',
              email: 'admin@ldc-construction.local',
              name: 'Development Admin',
              role: 'super_admin',
              regionId: '01.12',
              zoneId: '01'
            };
          }
          
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log('NextAuth JWT: Adding user to token:', user);
        token.role = user.role;
        token.regionId = user.regionId;
        token.zoneId = user.zoneId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        console.log('NextAuth Session: Creating session from token:', token);
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.regionId = token.regionId as string;
        session.user.zoneId = token.zoneId as string;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: `ldc-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET || 'ldc-construction-tools-secret-2024',
  debug: process.env.NODE_ENV === 'development'
};
