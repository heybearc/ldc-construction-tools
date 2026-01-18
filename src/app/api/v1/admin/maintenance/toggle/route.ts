import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { promises as fs } from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'data', 'maintenance-config.json');

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { enabled } = body;

    // Read current config
    const data = await fs.readFile(CONFIG_FILE, 'utf-8');
    const config = JSON.parse(data);

    // Update enabled status
    config.enabled = enabled;
    config.updatedAt = new Date().toISOString();
    config.updatedBy = session.user.email;

    // Save back to file
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));

    return NextResponse.json({
      success: true,
      enabled: config.enabled
    });
  } catch (error) {
    console.error('Error toggling maintenance mode:', error);
    return NextResponse.json(
      { error: 'Failed to toggle maintenance mode' },
      { status: 500 }
    );
  }
}
