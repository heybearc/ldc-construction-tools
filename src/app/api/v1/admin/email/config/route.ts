import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encryptPassword } from '@/lib/email-crypto';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET /api/v1/admin/email/config - Get current email configuration
export async function GET() {
  try {
    const config = await prisma.emailConfiguration.findFirst({
      where: { isActive: true },
      select: {
        id: true,
        provider: true,
        displayName: true,
        smtpHost: true,
        smtpPort: true,
        encryption: true,
        fromEmail: true,
        fromName: true,
        username: true,
        isActive: true,
        testStatus: true,
        lastTested: true,
        createdAt: true,
        updatedAt: true,
        // Don't return appPasswordEncrypted for security
      }
    });

    return NextResponse.json({
      success: true,
      config: config || null
    });
  } catch (error) {
    console.error('Get email config error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load email configuration' },
      { status: 500 }
    );
  }
}

// POST /api/v1/admin/email/config - Save email configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      provider,
      displayName,
      smtpHost,
      smtpPort,
      encryption,
      fromEmail,
      fromName,
      username,
      password,
      isActive
    } = body;

    if (!fromEmail || !username || !password) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Encrypt password with reversible encryption
    const encryptedPassword = encryptPassword(password);
    
    // Deactivate existing configurations
    await prisma.emailConfiguration.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    // Create or update configuration
    const config = await prisma.emailConfiguration.create({
      data: {
        provider: provider || 'GMAIL',
        displayName: displayName || 'Gmail Configuration',
        smtpHost: smtpHost || 'smtp.gmail.com',
        smtpPort: smtpPort || 587,
        encryption: encryption || 'tls',
        fromEmail,
        fromName: fromName || 'LDC Tools',
        username,
        appPasswordEncrypted: encryptedPassword,
        isActive: isActive !== false,
        testStatus: 'untested'
      },
      select: {
        id: true,
        provider: true,
        displayName: true,
        smtpHost: true,
        smtpPort: true,
        encryption: true,
        fromEmail: true,
        fromName: true,
        username: true,
        isActive: true,
        testStatus: true,
        lastTested: true,
        createdAt: true,
        updatedAt: true
      }
    });

    console.log(`Email configuration updated: ${fromEmail} (${provider})`);
    
    return NextResponse.json({
      success: true,
      message: 'Email configuration saved successfully',
      config
    });
  } catch (error) {
    console.error('Save email config error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save email configuration' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/admin/email/config - Update email configuration (same as POST)
export async function PUT(request: NextRequest) {
  return POST(request);
}
