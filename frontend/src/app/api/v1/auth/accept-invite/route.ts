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

    // Find user with this invite token
    const user = await prisma.user.findFirst({
      where: {
        inviteToken: token,
        inviteExpires: {
          gte: new Date() // Token not expired
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired invitation token' },
        { status: 404 }
      );
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user with password and clear invite token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        emailVerified: new Date(), // Mark email as verified
        inviteToken: null, // Clear the token
        inviteExpires: null,
        status: 'ACTIVE'
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
