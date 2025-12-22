import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { valid: false, message: 'No invitation token provided' },
        { status: 400 }
      );
    }

    // Find user with this invite token
    const user = await prisma.user.findFirst({
      where: {
        inviteToken: token,
        inviteExpires: {
          gte: new Date() // Token not expired
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        inviteExpires: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { valid: false, message: 'Invalid or expired invitation token' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Verify invite error:', error);
    return NextResponse.json(
      { valid: false, message: 'Failed to verify invitation' },
      { status: 500 }
    );
  }
}
