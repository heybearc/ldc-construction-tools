import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authConfig } from '../../../../../auth.config';

const prisma = new PrismaClient();

// GET /api/v1/roles - List all roles
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const scope = searchParams.get('scope');
    const isActive = searchParams.get('isActive');

    // Build filter conditions
    const where: any = {};
    
    if (type) where.type = type;
    if (scope) where.scope = scope;
    if (isActive !== null) where.isActive = isActive === 'true';

    const roles = await prisma.role.findMany({
      where,
      include: {
        _count: {
          select: {
            assignments: {
              where: {
                isActive: true
              }
            }
          }
        }
      },
      orderBy: [
        { level: 'desc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json({
      success: true,
      data: roles,
      count: roles.length
    });

  } catch (error) {
    console.error('Roles fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

// POST /api/v1/roles - Create new role
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to create roles
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      displayName,
      description,
      type,
      scope,
      level,
      permissions,
      regionId
    } = body;

    // Validate required fields
    if (!name || !displayName || !type || !scope) {
      return NextResponse.json(
        { error: 'Missing required fields: name, displayName, type, scope' },
        { status: 400 }
      );
    }

    // Check if role name already exists
    const existingRole = await prisma.role.findUnique({
      where: { name }
    });

    if (existingRole) {
      return NextResponse.json(
        { error: 'Role name already exists' },
        { status: 409 }
      );
    }

    // Create role
    const role = await prisma.role.create({
      data: {
        name,
        displayName,
        description,
        type,
        scope,
        level: level || 0,
        permissions: permissions || [],
        regionId
      }
    });

    return NextResponse.json({
      success: true,
      data: role,
      message: 'Role created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Role creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    );
  }
}
