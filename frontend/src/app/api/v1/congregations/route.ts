import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { getCGScope } from '@/lib/cg-scope';
import { getUserOrgRoles, checkPermission } from '@/lib/api-permissions';
import { canManageVolunteers } from '@/lib/permissions';

// GET /api/v1/congregations - List all congregations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cgScope = await getCGScope();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const where: any = {
      constructionGroupId: cgScope.constructionGroupId,
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { congregationNumber: { contains: search, mode: 'insensitive' } },
        { state: { contains: search, mode: 'insensitive' } },
        { coordinatorName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const congregations = await prisma.congregation.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    const transformed = congregations.map(c => ({
      id: c.id,
      name: c.name,
      state: c.state,
      congregation_number: c.congregationNumber,
      coordinator_name: c.coordinatorName,
      coordinator_phone: c.coordinatorPhone,
      coordinator_email: c.coordinatorEmail,
      congregation_email: c.congregationEmail,
      is_active: c.isActive,
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error fetching congregations:', error);
    return NextResponse.json({ error: 'Failed to fetch congregations' }, { status: 500 });
  }
}

// POST /api/v1/congregations - Create a new congregation
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

    const congregation = await prisma.congregation.create({
      data: {
        name: body.name,
        state: body.state || null,
        congregationNumber: body.congregation_number || null,
        coordinatorName: body.coordinator_name || null,
        coordinatorPhone: body.coordinator_phone || null,
        coordinatorEmail: body.coordinator_email || null,
        congregationEmail: body.congregation_email || null,
        constructionGroupId: cgScope.constructionGroupId,
      },
    });

    return NextResponse.json({
      id: congregation.id,
      name: congregation.name,
      state: congregation.state,
      congregation_number: congregation.congregationNumber,
      coordinator_name: congregation.coordinatorName,
      coordinator_phone: congregation.coordinatorPhone,
      coordinator_email: congregation.coordinatorEmail,
      congregation_email: congregation.congregationEmail,
      is_active: congregation.isActive,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating congregation:', error);
    return NextResponse.json({ error: 'Failed to create congregation' }, { status: 500 });
  }
}
