import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { canAccessAdmin } from '@/lib/permissions';

// PATCH /api/v1/admin/users/[id]/link-volunteer - Link user to volunteer
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !canAccessAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { volunteerId } = await request.json();

    // Validate volunteerId
    if (volunteerId) {
      const volunteer = await prisma.volunteer.findUnique({
        where: { id: volunteerId }
      });

      if (!volunteer) {
        return NextResponse.json({ error: 'Volunteer not found' }, { status: 404 });
      }

      // Check if volunteer is already linked to another user
      const existingLink = await prisma.user.findFirst({
        where: { 
          volunteerId,
          id: { not: params.id }
        }
      });

      if (existingLink) {
        return NextResponse.json({ 
          error: 'This volunteer is already linked to another user' 
        }, { status: 400 });
      }
    }

    // Update user with volunteerId
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { volunteerId: volunteerId || null }
    });

    return NextResponse.json({ 
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error linking volunteer to user:', error);
    return NextResponse.json({ error: 'Failed to link volunteer' }, { status: 500 });
  }
}
