import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { isAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!isAdmin(session)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }
    
    // Get total users
    const totalUsers = await prisma.user.count();
    
    // Get active users (email verified)
    const activeUsers = await prisma.user.count({
      where: {
        emailVerified: { not: null }
      }
    });
    
    // Get invited users (not verified)
    const invitedUsers = await prisma.user.count({
      where: {
        emailVerified: null
      }
    });
    
    const stats = {
      total: totalUsers,
      active: activeUsers,
      invited: invitedUsers,
      inactive: 0 // We don't have an inactive status in the schema
    };
    
    return NextResponse.json({
      stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Admin user stats API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch user stats',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
