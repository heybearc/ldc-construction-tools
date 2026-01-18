import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

// GET /api/v1/projects/[id]/schedule/[versionId] - Get schedule version with entries
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const version = await prisma.projectScheduleVersion.findUnique({
      where: { id: params.versionId },
      include: {
        entries: {
          where: { isActive: true },
          include: {
            tradeTeam: true,
            crew: true,
          },
          orderBy: { startDate: 'asc' },
        },
      },
    });

    if (!version) {
      return NextResponse.json({ error: 'Schedule version not found' }, { status: 404 });
    }

    return NextResponse.json(version);
  } catch (error) {
    console.error('Get schedule version error:', error);
    return NextResponse.json({ error: 'Failed to fetch schedule version' }, { status: 500 });
  }
}

// PATCH /api/v1/projects/[id]/schedule/[versionId] - Update schedule version
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, notes, isCurrent } = body;

    // If setting as current, unset other versions
    if (isCurrent) {
      await prisma.projectScheduleVersion.updateMany({
        where: { projectId: params.id, isCurrent: true },
        data: { isCurrent: false },
      });
    }

    const version = await prisma.projectScheduleVersion.update({
      where: { id: params.versionId },
      data: {
        ...(name !== undefined && { name }),
        ...(notes !== undefined && { notes }),
        ...(isCurrent !== undefined && { isCurrent }),
      },
    });

    return NextResponse.json(version);
  } catch (error) {
    console.error('Update schedule version error:', error);
    return NextResponse.json({ error: 'Failed to update schedule version' }, { status: 500 });
  }
}

// DELETE /api/v1/projects/[id]/schedule/[versionId] - Soft delete schedule version
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.projectScheduleVersion.update({
      where: { id: params.versionId },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete schedule version error:', error);
    return NextResponse.json({ error: 'Failed to delete schedule version' }, { status: 500 });
  }
}
