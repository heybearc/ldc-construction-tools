// API route for managing construction groups
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { STANDARD_TRADE_TEAMS } from '@/lib/standard-trade-teams';

// POST: Create a new construction group (SUPER_ADMIN only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is SUPER_ADMIN
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only SUPER_ADMIN can create construction groups' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { code, name, regionId } = body;

    if (!code || !regionId) {
      return NextResponse.json(
        { error: 'Code and regionId are required' },
        { status: 400 }
      );
    }

    // Check if region exists
    const region = await prisma.region.findUnique({ where: { id: regionId } });
    if (!region) {
      return NextResponse.json({ error: 'Region not found' }, { status: 404 });
    }

    // Check if code already exists
    const existing = await prisma.constructionGroup.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json(
        { error: `Construction Group with code "${code}" already exists` },
        { status: 409 }
      );
    }

    // Create the construction group with standard trade teams
    const constructionGroup = await prisma.constructionGroup.create({
      data: {
        code,
        name: name || code,
        regionId,
        isActive: true,
        // Auto-create standard trade teams for this CG
        tradeTeams: {
          create: STANDARD_TRADE_TEAMS.map(team => ({
            name: team.name,
            description: team.description,
            isActive: true
          }))
        }
      },
      include: {
        tradeTeams: true
      }
    });

    console.log(`✅ Created CG "${code}" with ${constructionGroup.tradeTeams.length} standard trade teams`);

    return NextResponse.json({ 
      constructionGroup,
      message: `Created with ${constructionGroup.tradeTeams.length} standard trade teams`
    }, { status: 201 });

  } catch (error) {
    console.error('Create construction group error:', error);
    return NextResponse.json(
      { error: 'Failed to create construction group' },
      { status: 500 }
    );
  }
}
