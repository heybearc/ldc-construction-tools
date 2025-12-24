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
          include: {
            _count: {
              select: { volunteers: true }
            },
            volunteers: {
              select: { 
                id: true,
                isOverseer: true,
                isAssistant: true
              }
            }
          }
        },
        volunteers: {
          where: { isActive: true },
          select: { 
            id: true, 
            firstName: true, 
            lastName: true,
            isOverseer: true,
            isAssistant: true
          }
        },
        _count: {
          select: {
            crews: true,
            volunteers: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Transform data to match expected format with oversight counts
    const transformedTeams = tradeTeams.map((team: any) => {
      // Count only non-oversight volunteers assigned directly to trade team
      const directNonOversightVolunteers = team.volunteers.filter((v: any) => 
        !v.isOverseer && !v.isAssistant
      ).length;
      
      // Count volunteers in crews
      const crewVolunteers = team.crews.reduce((sum: number, crew: any) => sum + crew._count.volunteers, 0);
      const totalMembers = directNonOversightVolunteers + crewVolunteers;

      // Count trade team oversight roles (using legacy flags)
      const ttoCount = team.volunteers.filter((v: any) => v.isOverseer).length;
      const ttoaCount = team.volunteers.filter((v: any) => v.isAssistant).length;
      const ttsCount = 0; // No legacy flag for support role

      // Count crews needing oversight
      const crewsNeedingTCO = team.crews.filter((crew: any) =>
        !crew.volunteers.some((v: any) => v.isOverseer)
      ).length;

      const result: any = {
        id: team.id,
        name: team.name,
        crew_count: team._count.crews,
        total_members: totalMembers,
        active_crews: team.crews.length,
        is_active: team.isActive,
        oversight: {
          tto: { filled: ttoCount, required: 1 },
          ttoa: { filled: ttoaCount, required: 2 },
          tts: { filled: ttsCount, required: 0 },
          crews_needing_tco: crewsNeedingTCO
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
