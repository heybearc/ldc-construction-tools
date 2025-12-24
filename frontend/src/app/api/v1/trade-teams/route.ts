import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeCrews = searchParams.get('include_crews') === 'true';

    const tradeTeams = await prisma.tradeTeam.findMany({
      include: {
        crews: {
          where: { isActive: true },
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            crews: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Transform data to match expected format with oversight counts
    const transformedTeams = tradeTeams.map((team: any) => {
      const result: any = {
        id: team.id,
        name: team.name,
        crew_count: team._count.crews,
        total_members: 0, // No volunteer data yet
        active_crews: team.crews.length,
        is_active: team.isActive,
        oversight: {
          tto: { filled: 0, required: 1 },
          ttoa: { filled: 0, required: 2 },
          tts: { filled: 0, required: 0 },
          crews_needing_tco: team.crews.length // All crews need oversight until volunteers are assigned
        }
      };

      // Include crews array if requested
      if (includeCrews) {
        result.crews = team.crews.map(crew => ({
          id: crew.id,
          name: crew.name
        }));
      }

      return result;
    });

    return NextResponse.json(transformedTeams);

  } catch (error) {
    console.error('Trade Teams API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trade teams', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const tradeTeam = await prisma.tradeTeam.create({
      data: {
        name: body.name,
        description: body.description,
        isActive: body.isActive ?? true
      },
      include: {
        _count: {
          select: {
            crews: true,
            volunteers: true
          }
        }
      }
    });

    return NextResponse.json(tradeTeam);

  } catch (error) {
    console.error('Trade Teams Create Error:', error);
    return NextResponse.json(
      { error: 'Failed to create trade team', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
