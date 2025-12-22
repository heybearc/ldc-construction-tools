import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { getCGScope } from '@/lib/cg-scope';

export const dynamic = 'force-dynamic';

// GET /api/v1/announcements - Fetch active announcements for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true, 
        role: true,
        constructionGroupId: true 
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const now = new Date();
    
    // Build where clause for active announcements
    const where: any = {
      isActive: true,
      OR: [
        { startDate: null },
        { startDate: { lte: now } }
      ],
      AND: [
        {
          OR: [
            { endDate: null },
            { endDate: { gte: now } }
          ]
        }
      ]
    };

    // Filter by CG scope and role targeting
    const cgWhere: any[] = [
      { constructionGroupId: null }, // Global announcements
    ];
    
    if (user.constructionGroupId) {
      cgWhere.push({ constructionGroupId: user.constructionGroupId });
    }

    where.AND.push({ OR: cgWhere });

    const announcements = await prisma.announcement.findMany({
      where,
      include: {
        creator: {
          select: {
            name: true,
            email: true
          }
        },
        constructionGroup: {
          select: {
            name: true,
            code: true
          }
        }
      },
      orderBy: [
        { type: 'desc' }, // URGENT first, then WARNING, then INFO
        { createdAt: 'desc' }
      ]
    });

    // Filter by target roles if specified
    const filteredAnnouncements = announcements.filter(announcement => {
      if (!announcement.targetRoles || announcement.targetRoles.length === 0) {
        return true; // No role targeting, show to everyone
      }
      return announcement.targetRoles.includes(user.role);
    });

    return NextResponse.json({
      success: true,
      data: filteredAnnouncements
    });

  } catch (error) {
    console.error('Get announcements error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}
