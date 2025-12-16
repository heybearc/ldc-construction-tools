import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';;


export async function GET(request: NextRequest) {
  console.log('Trade teams API route called:', request.url);
  
  try {
    // Direct Prisma query instead of FastAPI backend call
    const tradeTeams = await prisma.tradeTeam.findMany({
      include: {
        crews: {
          where: { isActive: true }
        },
        _count: {
          select: {
            crews: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Transform data to match expected format
    const transformedTeams = tradeTeams.map(team => ({
      id: team.id,
      name: team.name,
      crew_count: team._count.crews,
      total_members: 0, // TODO: Count members from TradeTeamMembers join table
      active_crews: team.crews.length,
      is_active: team.isActive
    }));

    console.log(`✅ WMACS: Retrieved ${transformedTeams.length} trade teams via Prisma`);
    return NextResponse.json(transformedTeams);
    
  } catch (error) {
    console.error('WMACS Trade Teams API Error:', error);
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
            TradeTeamMembers: true
          }
        }
      }
    });

    console.log(`✅ WMACS: Created trade team ${tradeTeam.name} via Prisma`);
    return NextResponse.json(tradeTeam);
    
  } catch (error) {
    console.error('WMACS Trade Teams Create Error:', error);
    return NextResponse.json(
      { error: 'Failed to create trade team', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}