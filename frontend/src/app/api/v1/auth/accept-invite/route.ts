import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { success: false, message: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters' },
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
      }
    });

    if (!invitation) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired invitation token' },
        { status: 404 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: invitation.email }
    });

    if (!user || user.status !== 'INVITED') {
      return NextResponse.json(
        { success: false, message: 'Invalid invitation' },
        { status: 404 }
      );
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user with password and activate account
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        emailVerified: new Date(), // Mark email as verified
        status: 'ACTIVE'
      }
    });

    // Mark invitation as accepted
    await prisma.userInvitation.update({
      where: { id: invitation.id },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Account setup completed successfully'
    });

  } catch (error) {
    console.error('Accept invite error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to complete account setup' },
      { status: 500 }
    );
  }
}
