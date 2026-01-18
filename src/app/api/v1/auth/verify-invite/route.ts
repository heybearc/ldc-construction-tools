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

    // Find invitation with this token
    const invitation = await prisma.userInvitation.findFirst({
      where: {
        invitationToken: token,
        expiresAt: {
          gte: new Date() // Token not expired
        },
        status: 'PENDING'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        expiresAt: true
      }
    });

    if (!invitation) {
      return NextResponse.json(
        { valid: false, message: 'Invalid or expired invitation token' },
        { status: 404 }
      );
    }

    // Get the user record
    const user = await prisma.user.findUnique({
      where: { email: invitation.email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true
      }
    });

    if (!user || user.status !== 'INVITED') {
      return NextResponse.json(
        { valid: false, message: 'Invalid invitation' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      user: {
        name: user.name || `${invitation.firstName} ${invitation.lastName}`.trim(),
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
