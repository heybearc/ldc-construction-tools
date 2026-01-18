// API route for Trade Team Oversight management
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TRADE_TEAM_OVERSIGHT_CONFIG, validateRoleLimit } from '@/lib/oversight-types';

// GET: List all oversight assignments for a trade team
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tradeTeamId = params.id;

    const oversight = await prisma.tradeTeamOversight.findMany({
      where: { tradeTeamId, isActive: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: [
        { role: 'asc' },
        { startDate: 'asc' }
      ]
    });

    // Group by role for easier UI consumption
    const grouped = {
      TTO: oversight.filter(o => o.role === 'TTO'),
      TTOA: oversight.filter(o => o.role === 'TTOA'),
      TT_SUPPORT: oversight.filter(o => o.role === 'TT_SUPPORT')
    };

    return NextResponse.json({
      oversight,
      grouped,
      config: TRADE_TEAM_OVERSIGHT_CONFIG
    });

  } catch (error) {
    console.error('Trade Team Oversight GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch oversight assignments' },
      { status: 500 }
    );
  }
}

// POST: Add a new oversight assignment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tradeTeamId = params.id;
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId and role are required' },
        { status: 400 }
      );
    }

    // Validate role exists
    if (!TRADE_TEAM_OVERSIGHT_CONFIG[role as keyof typeof TRADE_TEAM_OVERSIGHT_CONFIG]) {
      return NextResponse.json(
        { error: `Invalid role: ${role}. Valid roles: TTO, TTOA, TT_SUPPORT` },
        { status: 400 }
      );
    }

    // Check role limit
    const currentCount = await prisma.tradeTeamOversight.count({
      where: { tradeTeamId, role, isActive: true }
    });

    const validation = validateRoleLimit(TRADE_TEAM_OVERSIGHT_CONFIG, role, currentCount);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }

    // Check if user already has this role for this team
    const existing = await prisma.tradeTeamOversight.findFirst({
      where: { tradeTeamId, userId, role, isActive: true }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'User already has this role for this trade team' },
        { status: 409 }
      );
    }

    // Create the assignment
    const assignment = await prisma.tradeTeamOversight.create({
      data: {
        tradeTeamId,
        userId,
        role,
        isActive: true,
        startDate: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    console.log(`✅ Added ${role} to trade team ${tradeTeamId}: ${userId}`);
    return NextResponse.json(assignment, { status: 201 });

  } catch (error) {
    console.error('Trade Team Oversight POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create oversight assignment' },
      { status: 500 }
    );
  }
}
