import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

// GET /api/v1/user/debug - Debug user and volunteer linkage
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        volunteerId: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get volunteer details if linked
    let volunteer = null;
    let volunteerRoles = [];
    
    if (user.volunteerId) {
      volunteer = await prisma.volunteer.findUnique({
        where: { id: user.volunteerId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          personalEmail: true,
        }
      });

      // Get volunteer roles
      const roles = await prisma.$queryRaw<Array<{ id: string; roleCode: string; isActive: boolean }>>`
        SELECT id, "roleCode", "isActive"
        FROM "VolunteerRole" 
        WHERE "volunteerId" = ${user.volunteerId}
      `;
      volunteerRoles = roles;
    }

    return NextResponse.json({
      user,
      volunteer,
      volunteerRoles,
      diagnosis: {
        hasVolunteerId: !!user.volunteerId,
        volunteerFound: !!volunteer,
        activeRolesCount: volunteerRoles.filter(r => r.isActive).length,
        totalRolesCount: volunteerRoles.length,
      }
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json({ error: 'Failed to fetch debug info' }, { status: 500 });
  }
}
