import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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
      config: config || {
        provider: 'gmail',
        displayName: 'Gmail Configuration',
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        encryption: 'tls',
        fromEmail: '',
        fromName: 'LDC Tools',
        username: '',
        isActive: false,
        testStatus: 'untested'
      }
    });
  } catch (error) {
    console.error('Error fetching email configuration:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch email configuration' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/admin/email/config - Update email configuration
export async function PUT(request: NextRequest) {
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

    // Validate required fields
    if (!fromEmail || !username || !password) {
      return NextResponse.json(
        { success: false, message: 'From email, username, and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(fromEmail)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Deactivate existing configurations
    await prisma.emailConfiguration.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    // Create or update configuration
    const config = await prisma.emailConfiguration.create({
      data: {
        provider: provider || 'gmail',
        displayName: displayName || 'Gmail Configuration',
        smtpHost: smtpHost || 'smtp.gmail.com',
        smtpPort: smtpPort || 587,
        encryption: encryption || 'tls',
        fromEmail,
        fromName: fromName || 'LDC Construction Tools',
        username,
        appPasswordEncrypted: hashedPassword,
        isActive: isActive !== false, // Default to true unless explicitly false
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

    // Log configuration change for audit
    console.log(`Email configuration updated: ${fromEmail} (${provider})`);

    return NextResponse.json({
      success: true,
      message: 'Email configuration saved successfully',
      config
    });
  } catch (error) {
    console.error('Error saving email configuration:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save email configuration' },
      { status: 500 }
    );
  }
}
