// API route for managing regions
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

// POST: Create a new region (SUPER_ADMIN only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is SUPER_ADMIN
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Only SUPER_ADMIN can create regions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { code, name, zoneId } = body;

    if (!code || !zoneId) {
      return NextResponse.json(
        { error: 'Code and zoneId are required' },
        { status: 400 }
      );
    }

    // Check if zone exists
    const zone = await prisma.zone.findUnique({ where: { id: zoneId } });
    if (!zone) {
      return NextResponse.json({ error: 'Zone not found' }, { status: 404 });
    }

    // Check if code already exists
    const existing = await prisma.region.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json(
        { error: `Region with code "${code}" already exists` },
        { status: 409 }
      );
    }

    // Create the region
    const region = await prisma.region.create({
      data: {
        code,
        name: name || `Region ${code}`,
        zoneId,
        isActive: true,
      },
    });

    return NextResponse.json({ region }, { status: 201 });

  } catch (error) {
    console.error('Create region error:', error);
    return NextResponse.json(
      { error: 'Failed to create region' },
      { status: 500 }
    );
  }
}
