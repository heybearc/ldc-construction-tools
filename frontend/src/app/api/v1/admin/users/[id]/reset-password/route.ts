import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { isAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';
import { decryptPassword } from '@/lib/email-crypto';
import crypto from 'crypto';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!isAdmin(session)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        status: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store reset token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        inviteToken: resetToken,
        inviteExpires: resetExpires
      }
    });

    // Get email configuration
    const emailConfig = await prisma.emailConfiguration.findFirst({
      where: { isActive: true }
    });

    if (!emailConfig) {
      return NextResponse.json(
        { error: 'Email configuration not found' },
        { status: 500 }
      );
    }

    // Decrypt password
    const decryptedPassword = decryptPassword(emailConfig.smtpPassword);

    // Setup email transport
    const transportConfig: any = {
      host: emailConfig.smtpHost,
      port: emailConfig.smtpPort,
      secure: emailConfig.encryption === 'ssl',
      auth: {
        user: emailConfig.smtpUser,
        pass: decryptedPassword
      }
    };

    if (emailConfig.encryption === 'tls') {
      transportConfig.tls = {
        ciphers: 'SSLv3'
      };
    }

    const transporter = nodemailer.createTransport(transportConfig);

    // Generate reset link
    const baseUrl = process.env.NEXTAUTH_URL || 'https://ldctools.com';
    const resetLink = `${baseUrl}/auth/reset-password?token=${resetToken}`;

    // Send password reset email
    await transporter.sendMail({
      from: `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`,
      to: user.email,
      subject: 'Password Reset Request - LDC Tools',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #3b82f6; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Password Reset Request</h1>
          </div>
          
          <div style="padding: 30px; background-color: #f9fafb;">
            <p style="color: #1f2937; font-size: 16px; margin-bottom: 20px;">
              ${user.name ? `Dear ${user.name},` : 'Hello,'}
            </p>
            
            <p style="color: #4b5563; line-height: 1.6;">
              A password reset has been requested for your LDC Tools account. Click the button below to reset your password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Reset Password</a>
            </div>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #f59e0b;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>⏰ This link will expire in 24 hours.</strong>
              </p>
            </div>
            
            <p style="color: #9ca3af; font-size: 13px; margin-top: 30px;">
              If you didn't request this password reset, you can safely ignore this email. Your password will not be changed.
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      message: 'Password reset email sent successfully',
      email: user.email
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to send password reset email', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
