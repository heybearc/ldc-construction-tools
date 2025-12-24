import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

// DELETE /api/v1/volunteer-roles/[id] - Remove role assignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Check if role assignment exists
    const roleAssignment = await prisma.volunteerRole.findUnique({
      where: { id }
    });

    if (!roleAssignment) {
      return NextResponse.json(
        { error: 'Role assignment not found' },
        { status: 404 }
      );
    }

    // Delete the role assignment
    await prisma.volunteerRole.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Role assignment removed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing volunteer role:', error);
    return NextResponse.json(
      { error: 'Failed to remove role assignment' },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/volunteer-roles/[id] - Update role assignment
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { isPrimary, isActive, endDate, entityId, entityType } = body;

    // Check if role assignment exists
    const existing = await prisma.volunteerRole.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Role assignment not found' },
        { status: 404 }
      );
    }

    // Update the role assignment
    const updated = await prisma.volunteerRole.update({
      where: { id },
      data: {
        ...(isPrimary !== undefined && { isPrimary }),
        ...(isActive !== undefined && { isActive }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(entityId !== undefined && { entityId }),
        ...(entityType !== undefined && { entityType })
      },
      include: {
        volunteer: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating volunteer role:', error);
    return NextResponse.json(
      { error: 'Failed to update role assignment' },
      { status: 500 }
    );
  }
}
