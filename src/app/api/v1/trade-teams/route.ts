import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { getUserOrgRoles, checkPermission } from '@/lib/api-permissions';
import { canManageTradeTeams } from '@/lib/permissions';
import { getCGScope, withCGFilter } from '@/lib/cg-scope';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const scope = await getCGScope();
    if (!scope) {
      return NextResponse.json({ error: 'Unable to determine CG scope' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const includeCrews = searchParams.get('include_crews') === 'true';

    const tradeTeams = await prisma.tradeTeam.findMany({
      where: {
        ...withCGFilter(scope),
        isActive: true,
      },
      include: {
        crews: {
          where: { isActive: true },
          include: {
            _count: {
              select: { volunteers: true }
            },
            volunteers: {
              where: { isActive: true },
              select: { 
                id: true,
                roles: {
                  where: { 
                    isActive: true,
                    crewId: { not: null }
                  },
                  select: {
                    roleCode: true,
                    crewId: true
                  }
                }
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
            roles: {
              where: { 
                isActive: true,
                tradeTeamId: { not: null }
              },
              select: {
                roleCode: true,
                tradeTeamId: true
              }
            }
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
      // Count volunteers in crews (using actual crew assignment)
      const crewVolunteers = team.crews.reduce((sum: number, crew: any) => sum + crew._count.volunteers, 0);
      const totalMembers = crewVolunteers;

      // Count trade team oversight roles using organizational roles
      const ttoCount = team.volunteers.filter((v: any) => 
        v.roles?.some((r: any) => r.roleCode === 'TTO' && r.tradeTeamId === team.id)
      ).length;
      const ttoaCount = team.volunteers.filter((v: any) => 
        v.roles?.some((r: any) => r.roleCode === 'TTOA' && r.tradeTeamId === team.id)
      ).length;
      const ttsCount = team.volunteers.filter((v: any) => 
        v.roles?.some((r: any) => r.roleCode === 'TT-Support' && r.tradeTeamId === team.id)
      ).length;

      // Count crews needing TCO (Trade Crew Overseer)
      const crewsNeedingTCO = team.crews.filter((crew: any) =>
        !crew.volunteers.some((v: any) => 
          v.roles?.some((r: any) => r.roleCode === 'TCO' && r.crewId === crew.id)
        )
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
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const scope = await getCGScope();
    if (!scope) {
      return NextResponse.json({ error: 'Unable to determine CG scope' }, { status: 403 });
    }

    if (!scope.constructionGroupId) {
      return NextResponse.json({ error: 'No construction group assigned' }, { status: 403 });
    }

    // Check permissions - requires management role or admin
    const userOrgRoles = await getUserOrgRoles(session);
    const permissionError = checkPermission(canManageTradeTeams(session, userOrgRoles));
    if (permissionError) return permissionError;

    const body = await request.json();

    const tradeTeam = await prisma.tradeTeam.create({
      data: {
        name: body.name,
        description: body.description,
        isActive: body.isActive ?? true,
        constructionGroupId: scope.constructionGroupId,
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
