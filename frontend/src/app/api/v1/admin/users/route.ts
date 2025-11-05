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
    
    // Get query parameters for filtering
    const { searchParams } = request.nextUrl;
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';
    
    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (role) {
      where.role = role;
    }
    
    // Fetch users from database
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
        lastLogin: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Transform users to match expected format
    const transformedUsers = users.map(user => ({
      id: user.id,
      name: user.name || 'Unknown',
      email: user.email || '',
      role: user.role || 'READ_ONLY',
      status: user.emailVerified ? 'ACTIVE' : 'INVITED',
      regionId: '',
      zoneId: '',
      lastLogin: user.lastLogin?.toISOString(),
      createdAt: user.createdAt.toISOString(),
    }));
    
    return NextResponse.json({
      users: transformedUsers,
      total: transformedUsers.length
    });
    
  } catch (error) {
    console.error('Admin users API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch users',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
