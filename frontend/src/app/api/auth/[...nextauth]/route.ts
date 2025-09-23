import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Simplified NextAuth handler to eliminate Function.prototype.apply errors
const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      authorize: async (credentials) => {
        console.log('Auth attempt for:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials');
          return null;
        }

        // Development authentication
        if (credentials.email === 'admin@ldc-construction.local' && 
            credentials.password === 'AdminPass123!') {
          console.log('User found: YES');
          console.log('Password match: true');
          
          const user = {
            id: 'dev-admin-id',
            email: 'admin@ldc-construction.local',
            name: 'Development Admin',
            role: 'SUPER_ADMIN',
            regionId: '01.12',
            zoneId: '01'
          };
          
          return user;
        }
        
        console.log('Authentication failed');
        return null;
      }
    })
  ],
  pages: {
    signIn: '/auth/signin'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'ldc-construction-tools-secret-2024',
  debug: false // Disable debug to reduce console noise
});

export { handler as GET, handler as POST };
