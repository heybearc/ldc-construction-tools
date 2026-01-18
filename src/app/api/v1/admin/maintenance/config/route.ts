import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { promises as fs } from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'data', 'maintenance-config.json');

async function ensureConfigFile() {
  try {
    const dir = path.dirname(CONFIG_FILE);
    await fs.mkdir(dir, { recursive: true });
    
    try {
      await fs.access(CONFIG_FILE);
    } catch {
      // File doesn't exist, create default
      const defaultConfig = {
        enabled: false,
        message: 'LDC Tools is currently undergoing scheduled maintenance. We\'ll be back shortly!',
        allowedIPs: []
      };
      await fs.writeFile(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
    }
  } catch (error) {
    console.error('Error ensuring config file:', error);
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await ensureConfigFile();
    const data = await fs.readFile(CONFIG_FILE, 'utf-8');
    const config = JSON.parse(data);

    return NextResponse.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('Error getting maintenance config:', error);
    return NextResponse.json(
      { error: 'Failed to get maintenance configuration' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { enabled, message, scheduledStart, scheduledEnd, allowedIPs } = body;

    const config = {
      enabled: enabled || false,
      message: message || 'LDC Tools is currently undergoing scheduled maintenance. We\'ll be back shortly!',
      scheduledStart: scheduledStart || null,
      scheduledEnd: scheduledEnd || null,
      allowedIPs: allowedIPs || [],
      updatedAt: new Date().toISOString(),
      updatedBy: session.user.email
    };

    // Save to file
    await ensureConfigFile();
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));

    return NextResponse.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('Error saving maintenance config:', error);
    return NextResponse.json(
      { error: 'Failed to save maintenance configuration' },
      { status: 500 }
    );
  }
}
