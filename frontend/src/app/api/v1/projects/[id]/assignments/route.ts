import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { getCGScope } from '@/lib/cg-scope';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cgScope = await getCGScope();

    // Get project assignments (crew assignments)
    const assignments = await prisma.projectCrewAssignment.findMany({
      where: {
        projectId: params.id,
        isActive: true,
      },
      include: {
        crew: {
          include: {
            tradeTeam: true,
          },
        },
      },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error fetching project assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project assignments' },
      { status: 500 }
    );
  }
}

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

    const assignment = await prisma.projectCrewAssignment.create({
      data: {
        projectId: params.id,
        crewId: body.crewId,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        notes: body.notes || null,
        assignedBy: session.user.email || null,
      },
      include: {
        crew: {
          include: {
            tradeTeam: true,
          },
        },
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error('Error creating project assignment:', error);
    return NextResponse.json(
      { error: 'Failed to create project assignment' },
      { status: 500 }
    );
  }
}
