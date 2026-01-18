import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { getCGScope } from '@/lib/cg-scope';

// GET /api/v1/volunteers/stats - Get volunteer statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cgScope = await getCGScope();

    const volunteers = await prisma.volunteer.findMany({
      where: {
        constructionGroupId: cgScope.constructionGroupId,
        isActive: true,
      },
      select: {
        congregation: true,
        roles: {
          where: {
            isActive: true,
          },
          select: {
            roleName: true,
            roleCategory: true,
          },
        },
      },
    });

    // Calculate role breakdown from organizational roles
    const roleCount: Record<string, number> = {};
    const congregationCount: Record<string, number> = {};

    volunteers.forEach(v => {
      // Role breakdown from organizational roles
      v.roles.forEach(role => {
        roleCount[role.roleName] = (roleCount[role.roleName] || 0) + 1;
      });
      
      // Congregation breakdown
      if (v.congregation) {
        congregationCount[v.congregation] = (congregationCount[v.congregation] || 0) + 1;
      }
    });

    const role_breakdown = Object.entries(roleCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const congregation_breakdown = Object.entries(congregationCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      total_volunteers: volunteers.length,
      role_breakdown,
      congregation_breakdown,
    });
  } catch (error) {
    console.error('Error fetching volunteer stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
