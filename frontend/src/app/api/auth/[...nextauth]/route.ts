import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Development fallback
        if (credentials.email === 'admin@ldc-construction.local' && 
            credentials.password === 'AdminPass123!') {
          return {
            id: 'dev-admin-id',
            email: 'admin@ldc-construction.local',
            name: 'Development Admin',
            role: 'SUPER_ADMIN',
            regionId: '01.12',
            zoneId: '01'
          };
        }
        
        return null;
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
        token.role = (user as any).role;
        token.regionId = (user as any).regionId;
        token.zoneId = (user as any).zoneId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).regionId = token.regionId;
        (session.user as any).zoneId = token.zoneId;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || 'ldc-construction-tools-secret-2024'
});

export { handler as GET, handler as POST };
