import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { isAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { getCGScope, withCGFilter } from '@/lib/cg-scope';

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

    // Get CG scope for data filtering
    const cgScope = await getCGScope();
    
    // Get query parameters for filtering
    const { searchParams } = request.nextUrl;
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';
    
    // Build where clause with CG scoping
    const cgFilter = cgScope ? withCGFilter(cgScope) : {};
    const where: any = { ...cgFilter };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (role) {
      where.role = role;
    }
    
    // Fetch users from database with CG scope
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        ldcRole: true,
        adminLevel: true,
        status: true,
        regionId: true,
        zoneId: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
        lastLogin: true,
        constructionGroupId: true,
        constructionGroup: {
          select: {
            id: true,
            code: true,
            name: true,
            region: {
              select: {
                code: true,
                name: true,
                zone: {
                  select: {
                    code: true,
                    name: true,
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Transform users to match expected format
    // Compute display status based on emailVerified to match stats logic
    const transformedUsers = users.map(user => {
      // Determine status: if emailVerified is null, user is "INVITED"
      // Otherwise use the database status or default to ACTIVE
      let displayStatus: 'ACTIVE' | 'INVITED' | 'INACTIVE' = 'ACTIVE';
      if (!user.emailVerified) {
        displayStatus = 'INVITED';
      } else if (user.status === 'INACTIVE') {
        displayStatus = 'INACTIVE';
      }
      
      return {
        id: user.id,
        name: user.name || 'Unknown',
        email: user.email || '',
        role: user.role || 'READ_ONLY',
        adminLevel: user.adminLevel || undefined,
        status: displayStatus,
        regionId: user.regionId || '',
        zoneId: user.zoneId || '',
        lastLogin: user.lastLogin?.toISOString(),
        createdAt: user.createdAt.toISOString(),
        // Multi-tenant fields
        constructionGroupId: user.constructionGroupId,
        constructionGroup: user.constructionGroup ? {
          id: user.constructionGroup.id,
          code: user.constructionGroup.code,
          name: user.constructionGroup.name,
          regionCode: user.constructionGroup.region?.code,
          regionName: user.constructionGroup.region?.name,
          zoneCode: user.constructionGroup.region?.zone?.code,
          zoneName: user.constructionGroup.region?.zone?.name,
        } : null,
      };
    });
    
    return NextResponse.json({
      users: transformedUsers,
      total: transformedUsers.length,
      // Include scope info for UI
      scope: cgScope ? {
        constructionGroupId: cgScope.constructionGroupId,
        canViewAllBranches: cgScope.canViewAllBranches,
        canViewZoneRegions: cgScope.canViewZoneRegions,
      } : null,
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

// POST - Create a new user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!isAdmin(session)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, password, role, zoneId, regionId } = body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, and role are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      );
    }

    // Get CG scope for the new user
    const cgScope = await getCGScope();

    // Hash the password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        role,
        status: 'ACTIVE',
        zoneId: zoneId || null,
        regionId: regionId || null,
        constructionGroupId: cgScope?.constructionGroupId || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        zoneId: true,
        regionId: true,
        createdAt: true,
      }
    });

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        zoneId: newUser.zoneId,
        regionId: newUser.regionId,
        createdAt: newUser.createdAt.toISOString(),
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Failed to create user', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
