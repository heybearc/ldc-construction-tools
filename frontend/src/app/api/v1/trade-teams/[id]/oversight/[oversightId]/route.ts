// API route for individual Trade Team Oversight assignment
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH: Update an oversight assignment (e.g., deactivate, change dates)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; oversightId: string } }
) {
  try {
    const { oversightId } = params;
    const body = await request.json();
    const { isActive, endDate } = body;

    const assignment = await prisma.tradeTeamOversight.update({
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
    console.error('Trade Team Oversight PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update oversight assignment' },
      { status: 500 }
    );
  }
}

// DELETE: Remove an oversight assignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; oversightId: string } }
) {
  try {
    const { oversightId } = params;

    // Soft delete by setting isActive to false and endDate to now
    const assignment = await prisma.tradeTeamOversight.update({
      where: { id: oversightId },
      data: {
        isActive: false,
        endDate: new Date()
      }
    });

    console.log(`✅ Removed oversight assignment ${oversightId}`);
    return NextResponse.json({ success: true, id: assignment.id });

  } catch (error) {
    console.error('Trade Team Oversight DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete oversight assignment' },
      { status: 500 }
    );
  }
}
