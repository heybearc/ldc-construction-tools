import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('Auth attempt for:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }

        // Development fallback
        if (credentials.email === 'admin@ldc-construction.local' && 
            credentials.password === 'AdminPass123!') {
          console.log('User found: YES');
          console.log('Password match: true');
          
          return {
            id: 'dev-admin-id',
            email: 'admin@ldc-construction.local',
            name: 'Development Admin',
            role: 'SUPER_ADMIN',
            regionId: '01.12',
            zoneId: '01'
          };
        }
        
        console.log('Authentication failed');
        return null;
      }
    })
  ],
  pages: {
    signIn: '/auth/signin'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.regionId = (user as any).regionId;
        token.zoneId = (user as any).zoneId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).regionId = token.regionId;
        (session.user as any).zoneId = token.zoneId;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET || 'ldc-construction-tools-secret-2024'
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
