import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { canAccessAdmin } from '@/lib/permissions';

// POST /api/v1/admin/fix-user-link - Fix user-volunteer link for Cory L Test
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !canAccessAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email } = await request.json();

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, volunteerId: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('[fix-user-link] User found:', user);

    // Find volunteer with matching email and PCA role
    const volunteers = await prisma.$queryRaw<Array<{ id: string; firstName: string; lastName: string; email: string; roleCode: string }>>`
      SELECT DISTINCT v.id, v."firstName", v."lastName", v.email, vr."roleCode"
      FROM "Volunteer" v
      JOIN "VolunteerRole" vr ON v.id = vr."volunteerId"
      WHERE (v.email = ${email} OR v."personalEmail" = ${email})
      AND vr."roleCode" = 'PCA'
      AND vr."isActive" = true
    `;

    console.log('[fix-user-link] Volunteers found:', volunteers);

    if (volunteers.length === 0) {
      return NextResponse.json({ 
        error: 'No volunteer found with PCA role and matching email' 
      }, { status: 404 });
    }

    const volunteer = volunteers[0];

    // Link user to volunteer
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { volunteerId: volunteer.id }
    });

    console.log('[fix-user-link] User updated:', updatedUser);

    return NextResponse.json({ 
      success: true,
      message: `Successfully linked user ${email} to volunteer ${volunteer.firstName} ${volunteer.lastName}`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        volunteerId: updatedUser.volunteerId
      },
      volunteer: {
        id: volunteer.id,
        name: `${volunteer.firstName} ${volunteer.lastName}`,
        email: volunteer.email
      }
    });
  } catch (error) {
    console.error('[fix-user-link] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to link user to volunteer',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
