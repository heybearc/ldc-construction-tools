import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

// DELETE /api/v1/projects/[id]/crews/[crewId] - Remove crew from project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; crewId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Soft delete the assignment
    await prisma.projectCrewAssignment.updateMany({
      where: {
        projectId: params.id,
        crewId: params.crewId,
      },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove crew error:', error);
    return NextResponse.json({ error: 'Failed to remove crew' }, { status: 500 });
  }
}

// PATCH /api/v1/projects/[id]/crews/[crewId] - Update crew assignment
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; crewId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { startDate, endDate, notes } = body;

    const assignment = await prisma.projectCrewAssignment.updateMany({
      where: {
        projectId: params.id,
        crewId: params.crewId,
      },
      data: {
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(notes !== undefined && { notes }),
      },
    });

    return NextResponse.json({ success: true, updated: assignment.count });
  } catch (error) {
    console.error('Update crew assignment error:', error);
    return NextResponse.json({ error: 'Failed to update assignment' }, { status: 500 });
  }
}
