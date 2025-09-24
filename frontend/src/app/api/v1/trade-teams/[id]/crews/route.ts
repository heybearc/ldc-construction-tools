import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    console.log(`WMACS: Fetching crews for trade team ${id} via Prisma`);
    
    // Direct Prisma query instead of FastAPI backend call
    const crews = await prisma.crew.findMany({
      where: {
        tradeTeamId: id,
        isActive: true
      },
      include: {
        tradeTeam: {
          select: {
            id: true,
            name: true
          }
        },
        members: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            members: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Transform data to match expected format
    const transformedCrews = crews.map(crew => ({
      id: crew.id,
      name: crew.name,
      description: crew.description,
      trade_team_id: crew.tradeTeamId,
      trade_team_name: crew.tradeTeam.name,
      status: crew.status.toLowerCase(),
      member_count: crew._count.members,
      members: crew.members,
      created_at: crew.createdAt.toISOString(),
      updated_at: crew.updatedAt.toISOString()
    }));
    console.log(`✅ WMACS: Retrieved ${transformedCrews.length} crews for trade team ${id}`);
    return NextResponse.json(transformedCrews);
  } catch (error) {
    console.error('WMACS Trade Team Crews API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trade team crews', details: error.message },
      { status: 500 }
    );
  }
}
