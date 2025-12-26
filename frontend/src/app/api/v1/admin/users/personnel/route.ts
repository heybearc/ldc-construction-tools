import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { getCGScope } from '@/lib/cg-scope';
import { getUserOrgRoles } from '@/lib/api-permissions';

/**
 * GET /api/v1/admin/users/personnel
 * Returns users who have Personnel Contact Assistant (PCA) or Personnel Contact (PC) organizational roles
 * Used for assigning crew requests to personnel team members
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }
    
    // Check if user has personnel contact roles (can manage crew requests)
    const userOrgRoles = await getUserOrgRoles(session);
    const hasPersonnelRole = userOrgRoles.some(role => ['PC', 'PCA', 'PC-Support'].includes(role));
    
    if (!hasPersonnelRole) {
      return NextResponse.json(
        { error: 'Unauthorized - Personnel Contact role required' },
        { status: 403 }
      );
    }

    // Get CG scope for data filtering
    const cgScope = await getCGScope();
    
    // Query volunteers with Personnel roles (PCA, PC, PC-Support)
    // Then get their associated user accounts
    const personnelVolunteers = await prisma.$queryRaw<Array<{
      userId: string;
      userName: string | null;
      userEmail: string;
      volunteerId: string;
      volunteerName: string;
      roleCode: string;
    }>>`
      SELECT DISTINCT 
        u.id as "userId",
        u.name as "userName",
        u.email as "userEmail",
        v.id as "volunteerId",
        CONCAT(v."firstName", ' ', v."lastName") as "volunteerName",
        vr."roleCode"
      FROM volunteer_roles vr
      INNER JOIN volunteers v ON vr."volunteerId" = v.id
      LEFT JOIN "User" u ON v.id = u."volunteerId"
      WHERE vr."isActive" = true
        AND vr."roleCode" IN ('PCA', 'PC', 'PC-Support')
      ORDER BY "volunteerName"
    `;
    
    // Transform results - use volunteer name if user name is missing
    const userMap = new Map<string, any>();
    for (const row of personnelVolunteers) {
      // Skip if no user account exists
      if (!row.userId) continue;
      
      if (!userMap.has(row.userId)) {
        userMap.set(row.userId, {
          id: row.userId,
          name: row.userName || row.volunteerName || row.userEmail,
          email: row.userEmail,
          volunteerId: row.volunteerId,
          orgRoles: [row.roleCode],
        });
      } else {
        userMap.get(row.userId).orgRoles.push(row.roleCode);
      }
    }
    
    const users = Array.from(userMap.values());
    
    return NextResponse.json({
      users: users,
      total: users.length,
    });
    
  } catch (error) {
    console.error('Personnel users API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch personnel users',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
