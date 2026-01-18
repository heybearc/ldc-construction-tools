// API route for Trade Crew Oversight management
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TRADE_CREW_OVERSIGHT_CONFIG, validateRoleLimit } from '@/lib/oversight-types';

// GET: List all oversight assignments for a crew
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; crewId: string } }
) {
  try {
    const { crewId } = params;

    const oversight = await prisma.tradeCrewOversight.findMany({
      where: { crewId, isActive: true },
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

    const grouped = {
      TCO: oversight.filter(o => o.role === 'TCO'),
      TCOA: oversight.filter(o => o.role === 'TCOA'),
      TC_SUPPORT: oversight.filter(o => o.role === 'TC_SUPPORT')
    };

    return NextResponse.json({
      oversight,
      grouped,
      config: TRADE_CREW_OVERSIGHT_CONFIG
    });

  } catch (error) {
    console.error('Crew Oversight GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch oversight assignments' },
      { status: 500 }
    );
  }
}

// POST: Add a new oversight assignment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; crewId: string } }
) {
  try {
    const { crewId } = params;
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId and role are required' },
        { status: 400 }
      );
    }

    if (!TRADE_CREW_OVERSIGHT_CONFIG[role as keyof typeof TRADE_CREW_OVERSIGHT_CONFIG]) {
      return NextResponse.json(
        { error: `Invalid role: ${role}. Valid roles: TCO, TCOA, TC_SUPPORT` },
        { status: 400 }
      );
    }

    const currentCount = await prisma.tradeCrewOversight.count({
      where: { crewId, role, isActive: true }
    });

    const validation = validateRoleLimit(TRADE_CREW_OVERSIGHT_CONFIG, role, currentCount);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }

    const existing = await prisma.tradeCrewOversight.findFirst({
      where: { crewId, userId, role, isActive: true }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'User already has this role for this crew' },
        { status: 409 }
      );
    }

    const assignment = await prisma.tradeCrewOversight.create({
      data: {
        crewId,
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

    console.log(`✅ Added ${role} to crew ${crewId}: ${userId}`);
    return NextResponse.json(assignment, { status: 201 });

  } catch (error) {
    console.error('Crew Oversight POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create oversight assignment' },
      { status: 500 }
    );
  }
}
