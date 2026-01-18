import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';;
import { getServerSession } from 'next-auth';
import { authConfig } from '../../../../../auth.config';


// GET /api/v1/role-assignments - List role assignments with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const roleId = searchParams.get('roleId');
    const scope = searchParams.get('scope');
    const isActive = searchParams.get('isActive');
    const assignmentType = searchParams.get('assignmentType');

    // Build filter conditions
    const where: any = {};
    
    if (userId) where.userId = userId;
    if (roleId) where.roleId = roleId;
    if (scope) where.scope = scope;
    if (isActive !== null) where.isActive = isActive === 'true';
    if (assignmentType) where.assignmentType = assignmentType;

    const roleAssignments = await prisma.roleAssignment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            firstName: true,
            lastName: true,
            constructionGroupId: true,
            volunteer: {
              select: {
                constructionGroup: {
                  select: {
                    id: true,
                    code: true,
                    name: true,
                    region: {
                      select: {
                        code: true,
                        name: true,
                        zone: {
                          select: {
                            code: true,
                            name: true
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            constructionGroup: {
              select: {
                id: true,
                code: true,
                name: true,
                region: {
                  select: {
                    code: true,
                    name: true,
                    zone: {
                      select: {
                        code: true,
                        name: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        role: {
          select: {
            id: true,
            name: true,
            displayName: true,
            type: true,
            scope: true,
            level: true,
            permissions: true
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({
      success: true,
      data: roleAssignments,
      count: roleAssignments.length
    });

  } catch (error) {
    console.error('Role assignments fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch role assignments' },
      { status: 500 }
    );
  }
}

// POST /api/v1/role-assignments - Create new role assignment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      userId,
      roleId,
      assignmentType,
      scope,
      startDate,
      endDate,
      consultationRequired,
      notes
    } = body;

    // Validate required fields
    if (!userId || !roleId || !assignmentType) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, roleId, assignmentType' },
        { status: 400 }
      );
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.roleAssignment.findUnique({
      where: {
        userId_roleId_scope: {
          userId,
          roleId,
          scope: scope || ''
        }
      }
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'Role assignment already exists for this user, role, and scope' },
        { status: 409 }
      );
    }

    // Create role assignment
    const roleAssignment = await prisma.roleAssignment.create({
      data: {
        userId,
        roleId,
        assignmentType,
        scope,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        assignedBy: session.user.id!,
        consultationRequired: consultationRequired || false,
        consultationStatus: consultationRequired ? 'pending' : null,
        notes
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        role: {
          select: {
            id: true,
            name: true,
            displayName: true,
            type: true,
            scope: true
          }
        }
      }
    });

    // Log the role assignment change
    await prisma.roleChangeLog.create({
      data: {
        roleAssignmentId: roleAssignment.id,
        userId,
        roleId,
        action: 'assigned',
        newData: JSON.stringify(roleAssignment),
        reason: notes || 'Role assignment created',
        performedBy: session.user.id!
      }
    });

    return NextResponse.json({
      success: true,
      data: roleAssignment,
      message: 'Role assignment created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Role assignment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create role assignment' },
      { status: 500 }
    );
  }
}
