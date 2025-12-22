import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { version } = body;

    if (!version) {
      return NextResponse.json(
        { success: false, error: 'Version is required' },
        { status: 400 }
      );
    }

    // Update user's lastSeenReleaseVersion
    await prisma.user.update({
      where: { email: session.user.email },
      data: { 
        lastSeenReleaseVersion: version,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Release banner dismissed'
    });
  } catch (error) {
    console.error('Dismiss release banner error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to dismiss banner' },
      { status: 500 }
    );
  }
}
