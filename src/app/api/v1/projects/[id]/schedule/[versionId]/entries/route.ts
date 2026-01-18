import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

// GET /api/v1/projects/[id]/schedule/[versionId]/entries - Get all entries for a version
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const entries = await prisma.projectScheduleEntry.findMany({
      where: { 
        scheduleVersionId: params.versionId,
        isActive: true,
      },
      include: {
        tradeTeam: true,
        crew: true,
      },
      orderBy: { startDate: 'asc' },
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Get schedule entries error:', error);
    return NextResponse.json({ error: 'Failed to fetch schedule entries' }, { status: 500 });
  }
}

// POST /api/v1/projects/[id]/schedule/[versionId]/entries - Create a new entry
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; versionId: string } }
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

    if (!eventName || !startDate || !endDate) {
      return NextResponse.json({ 
        error: 'Event name, start date, and end date are required' 
      }, { status: 400 });
    }

    const entry = await prisma.projectScheduleEntry.create({
      data: {
        scheduleVersionId: params.versionId,
        tradeTeamId: tradeTeamId || null,
        crewId: crewId || null,
        eventName,
        category,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        volunteerCount: volunteerCount ? parseInt(volunteerCount) : null,
        notes,
      },
      include: {
        tradeTeam: true,
        crew: true,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Create schedule entry error:', error);
    return NextResponse.json({ error: 'Failed to create schedule entry' }, { status: 500 });
  }
}
