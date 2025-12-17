import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single trade team
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tradeTeam = await prisma.tradeTeam.findUnique({
      where: { id: params.id },
      include: {
        crews: {
          include: {
            _count: {
              select: { volunteers: true }
            }
          }
        },
        _count: {
          select: {
            crews: true
          }
        }
      }
    });

    if (!tradeTeam) {
      return NextResponse.json(
        { error: 'Trade team not found' },
        { status: 404 }
      );
    }

    // Calculate total volunteers across all crews
    const totalVolunteers = tradeTeam.crews.reduce(
      (sum, crew) => sum + crew._count.volunteers, 
      0
    );

    return NextResponse.json({
      id: tradeTeam.id,
      name: tradeTeam.name,
      description: tradeTeam.description,
      is_active: tradeTeam.isActive,
      crew_count: tradeTeam._count.crews,
      total_members: totalVolunteers,
      crews: tradeTeam.crews.map(crew => ({
        id: crew.id,
        name: crew.name,
        description: crew.description,
        status: crew.status.toLowerCase(),
        member_count: crew._count.volunteers,
        is_active: crew.isActive
      })),
      created_at: tradeTeam.createdAt,
      updated_at: tradeTeam.updatedAt
    });
  } catch (error) {
    console.error('Get trade team error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trade team' },
      { status: 500 }
    );
  }
}

// PATCH - Update trade team
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const existing = await prisma.tradeTeam.findUnique({
      where: { id: params.id }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Trade team not found' },
        { status: 404 }
      );
    }

    if (body.name && body.name !== existing.name) {
      const duplicate = await prisma.tradeTeam.findUnique({
        where: { name: body.name }
      });
      if (duplicate) {
        return NextResponse.json(
          { error: `Trade team "${body.name}" already exists` },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.tradeTeam.update({
      where: { id: params.id },
      data: {
        name: body.name ?? existing.name,
        description: body.description ?? existing.description,
        isActive: body.isActive ?? existing.isActive
      }
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      description: updated.description,
      is_active: updated.isActive
    });
  } catch (error) {
    console.error('Update trade team error:', error);
    return NextResponse.json(
      { error: 'Failed to update trade team' },
      { status: 500 }
    );
  }
}

// DELETE - Delete trade team
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.tradeTeam.findUnique({
      where: { id: params.id },
      include: {
        _count: { select: { crews: true } }
      }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Trade team not found' },
        { status: 404 }
      );
    }

    await prisma.tradeTeam.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      message: `Trade team "${existing.name}" deleted successfully`,
      deleted_crews: existing._count.crews
    });
  } catch (error) {
    console.error('Delete trade team error:', error);
    return NextResponse.json(
      { error: 'Failed to delete trade team' },
      { status: 500 }
    );
  }
}
