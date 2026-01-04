import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { getCGScope, withCGFilter } from '@/lib/cg-scope';
import { getUserOrgRoles, checkPermission } from '@/lib/api-permissions';
import { canManageVolunteers } from '@/lib/permissions';

// GET /api/v1/volunteers - List volunteers with optional filters
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cgScope = await getCGScope();
    if (!cgScope) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const congregation = searchParams.get('congregation') || '';
    const crewId = searchParams.get('crewId') || '';

    const where: any = {
      ...withCGFilter(cgScope),
      isActive: true,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { baId: { contains: search, mode: 'insensitive' } },
        { congregation: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (congregation) {
      where.congregation = congregation;
    }

    if (crewId) {
      where.crewId = crewId;
    }

    const volunteers = await prisma.volunteer.findMany({
      where,
      include: {
        crew: {
          include: {
            tradeTeam: true,
          },
        },
        tradeTeam: true,
        user: {
          select: { id: true, email: true, name: true },
        },
        roles: {
          where: { isActive: true },
          orderBy: [{ isPrimary: 'desc' }, { startDate: 'desc' }],
        },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });

    // Transform to match expected frontend format
    const transformed = volunteers.map(v => ({
      id: v.id,
      first_name: v.firstName,
      last_name: v.lastName,
      ba_id: v.baId,
      role: v.role,
      phone: v.phone,
      email_personal: v.emailPersonal,
      email_jw: v.emailJw,
      congregation: v.congregation,
      serving_as: v.servingAs,
      is_overseer: v.isOverseer,
      is_assistant: v.isAssistant,
      is_active: v.isActive,
      trade_crew_id: v.crewId,
      trade_crew_name: v.crew?.name,
      trade_team_id: v.tradeTeamId,
      trade_team_name: v.tradeTeam?.name || v.crew?.tradeTeam?.name,
      user_id: v.user?.id || null,
      has_user_account: !!v.user,
      roles: v.roles?.map(r => ({
        id: r.id,
        roleCategory: r.roleCategory,
        roleName: r.roleName,
        roleCode: r.roleCode,
        entityId: r.entityId,
        entityType: r.entityType,
        tradeTeamId: r.tradeTeamId,
        crewId: r.crewId,
        isPrimary: r.isPrimary,
        isActive: r.isActive,
        startDate: r.startDate.toISOString(),
        endDate: r.endDate?.toISOString() || null,
      })) || [],
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    return NextResponse.json({ error: 'Failed to fetch volunteers' }, { status: 500 });
  }
}

// POST /api/v1/volunteers - Create a new volunteer
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions - requires management role or admin
    const userOrgRoles = await getUserOrgRoles(session);
    const permissionError = checkPermission(canManageVolunteers(session, userOrgRoles));
    if (permissionError) return permissionError;

    const cgScope = await getCGScope();
    const body = await request.json();

    const volunteer = await prisma.volunteer.create({
      data: {
        firstName: body.first_name,
        lastName: body.last_name,
        baId: body.ba_id || null,
        phone: body.phone || null,
        emailPersonal: body.email_personal || null,
        emailJw: body.email_jw || null,
        congregation: body.congregation || null,
        servingAs: body.serving_as || [],
        crewId: body.trade_crew_id || null,
        tradeTeamId: body.trade_team_id || null,
        constructionGroupId: cgScope.constructionGroupId,
      },
      include: {
        crew: {
          include: {
            tradeTeam: true,
          },
        },
        tradeTeam: true,
      },
    });

    return NextResponse.json({
      id: volunteer.id,
      first_name: volunteer.firstName,
      last_name: volunteer.lastName,
      ba_id: volunteer.baId,
      phone: volunteer.phone,
      email_personal: volunteer.emailPersonal,
      email_jw: volunteer.emailJw,
      congregation: volunteer.congregation,
      serving_as: volunteer.servingAs,
      is_active: volunteer.isActive,
      trade_crew_id: volunteer.crewId,
      trade_crew_name: volunteer.crew?.name,
      trade_team_id: volunteer.tradeTeamId,
      trade_team_name: volunteer.tradeTeam?.name || volunteer.crew?.tradeTeam?.name,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating volunteer:', error);
    return NextResponse.json({ error: 'Failed to create volunteer' }, { status: 500 });
  }
}
