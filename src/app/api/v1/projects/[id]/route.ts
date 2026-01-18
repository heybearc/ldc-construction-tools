import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { getUserOrgRoles, checkPermission } from '@/lib/api-permissions';
import { canManageProjects } from '@/lib/permissions';

// GET /api/v1/projects/[id] - Get single project with crew assignments
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        constructionGroup: true,
        crewAssignments: {
          where: { isActive: true },
          include: {
            crew: {
              include: {
                tradeTeam: true,
                _count: {
                  select: { CrewMembers: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: {
            crewAssignments: { where: { isActive: true } },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

// PATCH /api/v1/projects/[id] - Update project
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions - requires management role or admin
    const userOrgRoles = await getUserOrgRoles(session);
    const permissionError = checkPermission(canManageProjects(session, userOrgRoles));
    if (permissionError) return permissionError;

    const body = await request.json();
    const { 
      name, 
      description, 
      projectNumber,
      location,
      projectType,
      currentPhase,
      status, 
      startDate, 
      endDate, 
      jwSharepointUrl,
      builderAssistantUrl,
      isActive 
    } = body;

    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(projectNumber !== undefined && { projectNumber }),
        ...(location !== undefined && { location }),
        ...(projectType !== undefined && { projectType }),
        ...(currentPhase !== undefined && { currentPhase }),
        ...(status !== undefined && { status }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(jwSharepointUrl !== undefined && { jwSharepointUrl }),
        ...(builderAssistantUrl !== undefined && { builderAssistantUrl }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        constructionGroup: true,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Update project error:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

// DELETE /api/v1/projects/[id] - Soft delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions - requires management role or admin
    const userOrgRoles = await getUserOrgRoles(session);
    const permissionError = checkPermission(canManageProjects(session, userOrgRoles));
    if (permissionError) return permissionError;

    await prisma.project.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
