import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

// PATCH /api/v1/projects/[id]/schedule/[versionId]/entries/[entryId] - Update entry
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; versionId: string; entryId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      tradeTeamId, 
      crewId, 
      eventName, 
      category, 
      startDate, 
      endDate, 
      volunteerCount, 
      notes 
    } = body;

    const entry = await prisma.projectScheduleEntry.update({
      where: { id: params.entryId },
      data: {
        ...(tradeTeamId !== undefined && { tradeTeamId: tradeTeamId || null }),
        ...(crewId !== undefined && { crewId: crewId || null }),
        ...(eventName !== undefined && { eventName }),
        ...(category !== undefined && { category }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: new Date(endDate) }),
        ...(volunteerCount !== undefined && { volunteerCount: volunteerCount ? parseInt(volunteerCount) : null }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        tradeTeam: true,
        crew: true,
      },
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Update schedule entry error:', error);
    return NextResponse.json({ error: 'Failed to update schedule entry' }, { status: 500 });
  }
}

// DELETE /api/v1/projects/[id]/schedule/[versionId]/entries/[entryId] - Soft delete entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; versionId: string; entryId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.projectScheduleEntry.update({
      where: { id: params.entryId },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete schedule entry error:', error);
    return NextResponse.json({ error: 'Failed to delete schedule entry' }, { status: 500 });
  }
}
