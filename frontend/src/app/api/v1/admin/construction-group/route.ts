import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

// GET - Get construction group settings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { constructionGroupId: true }
    });

    if (!user?.constructionGroupId) {
      return NextResponse.json({ error: 'No construction group assigned' }, { status: 403 });
    }

    const cg = await prisma.constructionGroup.findUnique({
      where: { id: user.constructionGroupId },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        cgProjectUrl: true,
        isActive: true
      }
    });

    if (!cg) {
      return NextResponse.json({ error: 'Construction group not found' }, { status: 404 });
    }

    return NextResponse.json(cg);
  } catch (error) {
    console.error('Get CG settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PATCH - Update construction group settings
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { constructionGroupId: true, role: true }
    });

    if (!user?.constructionGroupId) {
      return NextResponse.json({ error: 'No construction group assigned' }, { status: 403 });
    }

    // Only admins can update CG settings
    if (!user.role?.includes('ADMIN') && !user.role?.includes('OVERSEER')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { cgProjectUrl } = body;

    const updated = await prisma.constructionGroup.update({
      where: { id: user.constructionGroupId },
      data: {
        cgProjectUrl: cgProjectUrl || null
      },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        cgProjectUrl: true,
        isActive: true
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update CG settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
