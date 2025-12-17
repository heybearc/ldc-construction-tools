import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

// GET /api/v1/projects/[id]/schedule - Get all schedule versions for a project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const versions = await prisma.projectScheduleVersion.findMany({
      where: { 
        projectId: params.id,
        isActive: true,
      },
      include: {
        _count: {
          select: { entries: true },
        },
      },
      orderBy: { versionNumber: 'desc' },
    });

    return NextResponse.json(versions);
  } catch (error) {
    console.error('Get schedule versions error:', error);
    return NextResponse.json({ error: 'Failed to fetch schedule versions' }, { status: 500 });
  }
}

// POST /api/v1/projects/[id]/schedule - Create a new schedule version
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
    const { name, notes, duplicateFromVersionId } = body;

    // Get the next version number
    const lastVersion = await prisma.projectScheduleVersion.findFirst({
      where: { projectId: params.id },
      orderBy: { versionNumber: 'desc' },
    });
    const nextVersionNumber = (lastVersion?.versionNumber || 0) + 1;

    // Create the new version
    const newVersion = await prisma.projectScheduleVersion.create({
      data: {
        projectId: params.id,
        versionNumber: nextVersionNumber,
        name: name || `Version ${nextVersionNumber}`,
        notes,
        isCurrent: !lastVersion, // First version is current by default
      },
    });

    // If duplicating from another version, copy all entries
    if (duplicateFromVersionId) {
      const sourceEntries = await prisma.projectScheduleEntry.findMany({
        where: { 
          scheduleVersionId: duplicateFromVersionId,
          isActive: true,
        },
      });

      if (sourceEntries.length > 0) {
        await prisma.projectScheduleEntry.createMany({
          data: sourceEntries.map(entry => ({
            scheduleVersionId: newVersion.id,
            tradeTeamId: entry.tradeTeamId,
            crewId: entry.crewId,
            eventName: entry.eventName,
            category: entry.category,
            startDate: entry.startDate,
            endDate: entry.endDate,
            volunteerCount: entry.volunteerCount,
            notes: entry.notes,
          })),
        });
      }
    }

    return NextResponse.json(newVersion, { status: 201 });
  } catch (error) {
    console.error('Create schedule version error:', error);
    return NextResponse.json({ error: 'Failed to create schedule version' }, { status: 500 });
  }
}
