import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

// GET /api/v1/projects/[id]/crews - Get crews assigned to project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const assignments = await prisma.projectCrewAssignment.findMany({
      where: {
        projectId: params.id,
        isActive: true,
      },
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
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Get project crews error:', error);
    return NextResponse.json({ error: 'Failed to fetch project crews' }, { status: 500 });
  }
}

// POST /api/v1/projects/[id]/crews - Assign crew to project
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { crewId, startDate, endDate, notes } = body;

    if (!crewId) {
      return NextResponse.json({ error: 'Crew ID is required' }, { status: 400 });
    }

    // Check if assignment already exists
    const existing = await prisma.projectCrewAssignment.findUnique({
      where: {
        projectId_crewId: {
          projectId: params.id,
          crewId,
        },
      },
    });

    if (existing) {
      // Reactivate if soft deleted
      if (!existing.isActive) {
        const updated = await prisma.projectCrewAssignment.update({
          where: { id: existing.id },
          data: {
            isActive: true,
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
            notes,
            assignedBy: session.user.id,
          },
          include: {
            crew: {
              include: { tradeTeam: true },
            },
          },
        });
        return NextResponse.json(updated);
      }
      return NextResponse.json({ error: 'Crew already assigned to this project' }, { status: 409 });
    }

    const assignment = await prisma.projectCrewAssignment.create({
      data: {
        projectId: params.id,
        crewId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        notes,
        assignedBy: session.user.id,
      },
      include: {
        crew: {
          include: { tradeTeam: true },
        },
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error('Assign crew error:', error);
    return NextResponse.json({ error: 'Failed to assign crew' }, { status: 500 });
  }
}
