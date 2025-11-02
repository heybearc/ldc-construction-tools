import { Session } from 'next-auth';

/**
 * Check if user has admin privileges
 * Accepts: admin, ADMIN, SUPER_ADMIN
 */
export function isAdmin(session: Session | null): boolean {
  if (!session || !session.user) {
    return false;
  }
  
  const role = session.user.role?.toUpperCase();
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

/**
 * Check if user has super admin privileges
 */
export function isSuperAdmin(session: Session | null): boolean {
  if (!session || !session.user) {
    return false;
  }
  
  return session.user.role?.toUpperCase() === 'SUPER_ADMIN';
}
