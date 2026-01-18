// API route for individual Regional Staff member
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH: Update a regional staff assignment
export async function PATCH(
  request: NextRequest,
  { params }: { params: { regionId: string; staffId: string } }
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
    console.error('Regional Staff PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update regional staff assignment' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a regional staff assignment (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { regionId: string; staffId: string } }
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

    console.log(`✅ Removed regional staff ${staffId}`);
    return NextResponse.json({ success: true, id: staff.id });

  } catch (error) {
    console.error('Regional Staff DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete regional staff assignment' },
      { status: 500 }
    );
  }
}
