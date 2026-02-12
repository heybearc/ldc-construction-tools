import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { valid: false, message: 'Token is required' },
        { status: 400 }
      );
    }

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    });

    if (!verificationToken) {
      return NextResponse.json(
        { valid: false, message: 'Invalid or expired reset link' },
        { status: 404 }
      );
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { token }
      });

      return NextResponse.json(
        { valid: false, message: 'Reset link has expired. Please request a new one.' },
        { status: 410 }
      );
    }

    // Extract email from identifier (format: "password-reset:email@example.com")
    const email = verificationToken.identifier.replace('password-reset:', '');

    return NextResponse.json({
      valid: true,
      email
    });

  } catch (error) {
    console.error('Verify reset token error:', error);
    return NextResponse.json(
      { valid: false, message: 'Failed to verify reset token' },
      { status: 500 }
    );
  }
}
