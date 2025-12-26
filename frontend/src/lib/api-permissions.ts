import { Session } from 'next-auth';
import { prisma } from '@/lib/prisma';

/**
 * Fetch user's organizational role codes from their volunteer record
 * Used in API routes to check permissions
 */
export async function getUserOrgRoles(session: Session | null): Promise<string[]> {
  if (!session?.user?.email) {
    console.log('[getUserOrgRoles] No session or email');
    return [];
  }

  try {
    // Find user and their volunteer roles in one query
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    console.log('[getUserOrgRoles] User found:', user?.email, 'VolunteerId:', user?.volunteerId);

    if (!user?.volunteerId) {
      console.log('[getUserOrgRoles] No volunteerId for user');
      return [];
    }

    // Fetch active roles for this volunteer
    const roles = await prisma.$queryRaw<Array<{ roleCode: string }>>`
      SELECT "roleCode" 
      FROM "VolunteerRole" 
      WHERE "volunteerId" = ${user.volunteerId} 
      AND "isActive" = true
    `;

    console.log('[getUserOrgRoles] Roles found:', roles.map(r => r.roleCode));

    // Extract role codes
    return roles.map(role => role.roleCode);
  } catch (error) {
    console.error('Error fetching user org roles:', error);
    return [];
  }
}

/**
 * Check if user has permission and return 403 response if not
 * Returns null if permission granted, NextResponse with 403 if denied
 */
export function checkPermission(hasPermission: boolean) {
  if (!hasPermission) {
    return new Response(
      JSON.stringify({ 
        error: 'Forbidden', 
        message: 'You do not have permission to perform this action. Contact your administrator if you believe this is an error.' 
      }), 
      { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  return null;
}
