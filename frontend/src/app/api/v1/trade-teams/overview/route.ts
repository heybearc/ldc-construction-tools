// API route for Trade Teams Overview with all oversight data
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get all trade teams with crews and oversight assignments
    const tradeTeams = await prisma.tradeTeam.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        name: 'asc'
      },
      include: {
        oversight: {
          where: {
            isActive: true
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        crews: {
          where: {
            isActive: true
          },
          orderBy: {
            name: 'asc'
          },
          include: {
            oversight: {
              where: {
                isActive: true
              },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Transform data to match expected format
    const formattedTeams = tradeTeams.map(team => ({
      id: team.id,
      name: team.name,
      description: team.description,
      oversight: team.oversight.map(o => ({
        id: o.id,
        role: o.role,
        user: o.user
      })),
      crews: team.crews.map(crew => ({
        id: crew.id,
        name: crew.name,
        description: crew.description,
        scopeOfWork: crew.scopeOfWork,
        isRequired: crew.isRequired,
        status: crew.status,
        oversight: crew.oversight.map(o => ({
          id: o.id,
          role: o.role,
          user: o.user
        }))
      }))
    }));

    return NextResponse.json({
      tradeTeams: formattedTeams,
      totalTeams: formattedTeams.length,
      totalCrews: formattedTeams.reduce((sum, t) => sum + t.crews.length, 0)
    });

  } catch (error) {
    console.error('Trade Teams Overview error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch overview data' },
      { status: 500 }
    );
  }
}
