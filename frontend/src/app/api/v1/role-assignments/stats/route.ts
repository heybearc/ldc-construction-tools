import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authConfig } from '../../../../../../auth.config';

const prisma = new PrismaClient();

// GET /api/v1/role-assignments/stats - Get role statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const regionId = searchParams.get('regionId');
    const scope = searchParams.get('scope');

    // Build filter conditions
    const where: any = { isActive: true };
    if (regionId) {
      where.user = { regionId };
    }
    if (scope) {
      where.scope = scope;
    }

    // Get total active assignments
    const totalAssignments = await prisma.roleAssignment.count({
      where
    });

    // Get assignments by role type
    const assignmentsByRoleType = await prisma.roleAssignment.groupBy({
      by: ['roleId'],
      where,
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    // Get role details for the grouped data
    const roleIds = assignmentsByRoleType.map(item => item.roleId);
    const roles = await prisma.role.findMany({
      where: { id: { in: roleIds } },
      select: {
        id: true,
        name: true,
        displayName: true,
        type: true,
        scope: true
      }
    });

    const roleTypeStats = assignmentsByRoleType.map(item => {
      const role = roles.find(r => r.id === item.roleId);
      return {
        roleId: item.roleId,
        roleName: role?.name || 'Unknown',
        roleDisplayName: role?.displayName || 'Unknown',
        roleType: role?.type || 'Unknown',
        roleScope: role?.scope || 'Unknown',
        count: item._count.id
      };
    });

    // Get assignments by assignment type
    const assignmentsByType = await prisma.roleAssignment.groupBy({
      by: ['assignmentType'],
      where,
      _count: {
        id: true
      }
    });

    // Get assignments by scope
    const assignmentsByScope = await prisma.roleAssignment.groupBy({
      by: ['scope'],
      where,
      _count: {
        id: true
      }
    });

    // Get recent assignments (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAssignments = await prisma.roleAssignment.count({
      where: {
        ...where,
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Get assignments requiring consultation
    const consultationPending = await prisma.roleAssignment.count({
      where: {
        ...where,
        consultationRequired: true,
        consultationStatus: 'pending'
      }
    });

    // Get users with multiple roles
    const usersWithMultipleRoles = await prisma.user.findMany({
      where: {
        roleAssignments: {
          some: {
            isActive: true
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            roleAssignments: {
              where: {
                isActive: true
              }
            }
          }
        }
      },
      having: {
        roleAssignments: {
          _count: {
            gt: 1
          }
        }
      }
    });

    // Get vacant roles (roles with no active assignments)
    const allRoles = await prisma.role.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        displayName: true,
        type: true,
        _count: {
          select: {
            assignments: {
              where: {
                isActive: true
              }
            }
          }
        }
      }
    });

    const vacantRoles = allRoles.filter(role => role._count.assignments === 0);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalAssignments,
          recentAssignments,
          consultationPending,
          vacantRolesCount: vacantRoles.length,
          usersWithMultipleRoles: usersWithMultipleRoles.length
        },
        roleTypeStats,
        assignmentsByType: assignmentsByType.map(item => ({
          type: item.assignmentType,
          count: item._count.id
        })),
        assignmentsByScope: assignmentsByScope.map(item => ({
          scope: item.scope || 'Global',
          count: item._count.id
        })),
        vacantRoles: vacantRoles.map(role => ({
          id: role.id,
          name: role.name,
          displayName: role.displayName,
          type: role.type
        })),
        usersWithMultipleRoles: usersWithMultipleRoles.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          roleCount: user._count.roleAssignments
        }))
      }
    });

  } catch (error) {
    console.error('Role statistics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch role statistics' },
      { status: 500 }
    );
  }
}
