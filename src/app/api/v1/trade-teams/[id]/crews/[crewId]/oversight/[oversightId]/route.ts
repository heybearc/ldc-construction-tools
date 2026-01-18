// API route for individual Crew Oversight assignment
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH: Update an oversight assignment
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; crewId: string; oversightId: string } }
) {
  try {
    const { oversightId } = params;
    const body = await request.json();
    const { isActive, endDate } = body;

    const assignment = await prisma.tradeCrewOversight.update({
      where: { id: oversightId },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null })
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

    return NextResponse.json(assignment);

  } catch (error) {
    console.error('Crew Oversight PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update oversight assignment' },
      { status: 500 }
    );
  }
}

// DELETE: Remove an oversight assignment (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; crewId: string; oversightId: string } }
) {
  try {
    const { oversightId } = params;

    const assignment = await prisma.tradeCrewOversight.update({
      where: { id: oversightId },
      data: {
        isActive: false,
        endDate: new Date()
      }
    });

    console.log(`✅ Removed crew oversight assignment ${oversightId}`);
    return NextResponse.json({ success: true, id: assignment.id });

  } catch (error) {
    console.error('Crew Oversight DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete oversight assignment' },
      { status: 500 }
    );
  }
}
