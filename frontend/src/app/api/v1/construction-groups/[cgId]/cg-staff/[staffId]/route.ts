// API route for individual CG Staff member
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH: Update a CG staff assignment
export async function PATCH(
  request: NextRequest,
  { params }: { params: { cgId: string; staffId: string } }
) {
  try {
    const { staffId } = params;
    const body = await request.json();
    const { isActive, endDate } = body;

    const staff = await prisma.volunteerRole.update({
      where: { id: staffId },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null })
      }
    });

    return NextResponse.json(staff);

  } catch (error) {
    console.error('CG Staff PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update CG staff assignment' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a CG staff assignment (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { cgId: string; staffId: string } }
) {
  try {
    const { staffId } = params;

    const staff = await prisma.volunteerRole.update({
      where: { id: staffId },
      data: {
        isActive: false,
        endDate: new Date()
      }
    });

    console.log(`✅ Removed CG staff ${staffId}`);
    return NextResponse.json({ success: true, id: staff.id });

  } catch (error) {
    console.error('CG Staff DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete CG staff assignment' },
      { status: 500 }
    );
  }
}
