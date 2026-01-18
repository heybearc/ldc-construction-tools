import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { getUserOrgRoles, checkPermission } from '@/lib/api-permissions';
import { canManageTradeTeams } from '@/lib/permissions';
import { getCGScope, canAccessCG } from '@/lib/cg-scope';

// GET all crews for a trade team
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const scope = await getCGScope();
    if (!scope) {
      return NextResponse.json({ error: 'Unable to determine CG scope' }, { status: 403 });
    }

    // Verify trade team belongs to user's accessible CGs
    const tradeTeam = await prisma.tradeTeam.findUnique({
      where: { id: params.id },
      select: { constructionGroupId: true }
    });

    if (!tradeTeam || !tradeTeam.constructionGroupId || !canAccessCG(scope, tradeTeam.constructionGroupId)) {
      return NextResponse.json({ error: 'Trade team not found or access denied' }, { status: 404 });
    }

    const crews = await prisma.crew.findMany({
      where: {
        tradeTeamId: params.id,
        isActive: true
      },
      include: {
        tradeTeam: {
          select: { id: true, name: true }
        },
        _count: {
          select: { CrewMembers: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    const transformedCrews = crews.map(crew => ({
      id: crew.id,
      name: crew.name,
      description: crew.description,
      trade_team_id: crew.tradeTeamId,
      trade_team_name: crew.tradeTeam.name,
      status: crew.status.toLowerCase(),
      member_count: crew._count.CrewMembers,
      is_active: crew.isActive,
      created_at: crew.createdAt.toISOString(),
      updated_at: crew.updatedAt.toISOString()
    }));

    return NextResponse.json(transformedCrews);
  } catch (error) {
    console.error('Get crews error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch crews' },
      { status: 500 }
    );
  }
}

// POST - Create a new crew
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions - requires management role or admin
    const userOrgRoles = await getUserOrgRoles(session);
    const permissionError = checkPermission(canManageTradeTeams(session, userOrgRoles));
    if (permissionError) return permissionError;

    const body = await request.json();

    // Check if trade team exists
    const tradeTeam = await prisma.tradeTeam.findUnique({
      where: { id: params.id }
    });

    if (!tradeTeam) {
      return NextResponse.json(
        { error: 'Trade team not found' },
        { status: 404 }
      );
    }

    const crew = await prisma.crew.create({
      data: {
        name: body.name,
        description: body.description || null,
        tradeTeamId: params.id,
        status: body.status || 'ACTIVE',
        isActive: body.status !== 'INACTIVE'
      }
    });

    return NextResponse.json({
      id: crew.id,
      name: crew.name,
      description: crew.description,
      status: crew.status.toLowerCase(),
      is_active: crew.isActive
    }, { status: 201 });
  } catch (error) {
    console.error('Create crew error:', error);
    return NextResponse.json(
      { error: 'Failed to create crew' },
      { status: 500 }
    );
  }
}
