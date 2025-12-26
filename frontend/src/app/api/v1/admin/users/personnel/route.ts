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
    
    // Use raw query to efficiently find users with PCA or PC organizational roles
    // This joins users with their volunteer records and checks volunteer_roles table
    const personnelUsers = await prisma.$queryRaw<Array<{
      id: string;
      name: string | null;
      email: string;
      role: string;
      roleCode: string;
    }>>`
      SELECT DISTINCT 
        u.id,
        u.name,
        u.email,
        u.role,
        vr."roleCode"
      FROM "User" u
      INNER JOIN "Volunteer" v ON u."volunteerId" = v.id
      INNER JOIN "volunteer_roles" vr ON v.id = vr."volunteerId"
      WHERE vr."isActive" = true
        AND (vr."roleCode" = 'PCA' OR vr."roleCode" = 'PC')
      ${cgScope?.constructionGroupId ? prisma.$queryRawUnsafe(`AND u."constructionGroupId" = '${cgScope.constructionGroupId}'`) : prisma.$queryRawUnsafe('')}
      ORDER BY u.name
    `;
    
    // Transform results to include org roles grouped by user
    const userMap = new Map<string, any>();
    for (const row of personnelUsers) {
      if (!userMap.has(row.id)) {
        userMap.set(row.id, {
          id: row.id,
          name: row.name || row.email,
          email: row.email,
          role: row.role,
          orgRoles: [row.roleCode],
        });
      } else {
        userMap.get(row.id).orgRoles.push(row.roleCode);
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
