import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single crew
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; crewId: string } }
) {
  try {
    const crew = await prisma.crew.findUnique({
      where: { id: params.crewId },
      include: {
        tradeTeam: { select: { id: true, name: true } },
        _count: { select: { volunteers: true } }
      }
    });

    if (!crew || crew.tradeTeamId !== params.id) {
      return NextResponse.json({ error: 'Crew not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: crew.id,
      name: crew.name,
      description: crew.description,
      scopeOfWork: crew.scopeOfWork,
      status: crew.status,
      isActive: crew.isActive,
      isRequired: crew.isRequired,
      tradeTeam: crew.tradeTeam,
      member_count: crew._count.volunteers,
      createdAt: crew.createdAt,
      updatedAt: crew.updatedAt
    });
  } catch (error) {
    console.error('Get crew error:', error);
    return NextResponse.json({ error: 'Failed to fetch crew' }, { status: 500 });
  }
}

// PATCH - Update crew
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; crewId: string } }
) {
  try {
    const body = await request.json();

    const existing = await prisma.crew.findUnique({
      where: { id: params.crewId }
    });

    if (!existing || existing.tradeTeamId !== params.id) {
      return NextResponse.json({ error: 'Crew not found' }, { status: 404 });
    }

    const updated = await prisma.crew.update({
      where: { id: params.crewId },
      data: {
        name: body.name ?? existing.name,
        description: body.description ?? existing.description,
        status: body.status ?? existing.status,
        isActive: body.isActive ?? existing.isActive,
        isRequired: body.isRequired ?? existing.isRequired
      }
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      description: updated.description,
      status: updated.status,
      isActive: updated.isActive,
      isRequired: updated.isRequired
    });
  } catch (error) {
    console.error('Update crew error:', error);
    return NextResponse.json({ error: 'Failed to update crew' }, { status: 500 });
  }
}

// DELETE - Delete crew
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; crewId: string } }
) {
  try {
    const existing = await prisma.crew.findUnique({
      where: { id: params.crewId }
    });

    if (!existing || existing.tradeTeamId !== params.id) {
      return NextResponse.json({ error: 'Crew not found' }, { status: 404 });
    }

    await prisma.crew.delete({
      where: { id: params.crewId }
    });

    return NextResponse.json({ message: `Crew "${existing.name}" deleted` });
  } catch (error) {
    console.error('Delete crew error:', error);
    return NextResponse.json({ error: 'Failed to delete crew' }, { status: 500 });
  }
}
