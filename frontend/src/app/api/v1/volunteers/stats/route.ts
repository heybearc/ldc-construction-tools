import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';;


export async function GET(request: NextRequest) {
  try {
    const totalUsers = await prisma.user.count();
    
    const stats = {
      totalUsers,
      totalRoles: 5, // Static for now
      totalRoleAssignments: 0, // Static for now
      activeUsers: totalUsers,
      lastUpdated: new Date().toISOString()
    };

    console.log('Stats calculated:', stats);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch volunteer stats', details: error instanceof Error ? error.message : 'Database error' },
      { status: 500 }
    );
  }
}
