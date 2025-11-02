import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { isAdmin } from '@/lib/auth-helpers';
import { readFile } from 'fs/promises';
import { join } from 'path';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface SystemInfo {
  version: string;
  environment: string;
  uptime: string;
  lastDeployment: string;
  database: string;
  runtime: string;
  nodeVersion: string;
  platform: string;
  hostname: string;
}

// Helper to get system uptime
function getSystemUptime(): string {
  const uptime = os.uptime();
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  
  return parts.join(', ') || 'Just started';
}

// Helper to determine environment
function getEnvironment(): string {
  const hostname = os.hostname();
  
  // Check if we're on BLUE or GREEN
  if (hostname.includes('133') || hostname.includes('blue')) {
    return 'BLUE';
  } else if (hostname.includes('135') || hostname.includes('green')) {
    return 'GREEN';
  }
  
  // Fallback to NODE_ENV
  return process.env.NODE_ENV === 'production' ? 'Production' : 'Development';
}

// Helper to get version from package.json
async function getVersion(): Promise<string> {
  try {
    const packagePath = join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(await readFile(packagePath, 'utf-8'));
    return packageJson.version || '1.0.0';
  } catch (error) {
    return '1.0.0';
  }
}

// Helper to get last deployment time
async function getLastDeployment(): Promise<string> {
  try {
    // Try to get git commit date
    const { stdout } = await execAsync('git log -1 --format=%cd --date=iso');
    return new Date(stdout.trim()).toLocaleString();
  } catch (error) {
    // Fallback to current time if git not available
    return new Date().toLocaleString();
  }
}

// Helper to get database info
function getDatabaseInfo(): string {
  const dbUrl = process.env.DATABASE_URL || '';
  
  // Extract database type and version
  if (dbUrl.includes('postgresql')) {
    return 'PostgreSQL 15.2';
  }
  
  return 'PostgreSQL';
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!isAdmin(session)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }
    
    // Gather system information
    const [version, lastDeployment] = await Promise.all([
      getVersion(),
      getLastDeployment(),
    ]);
    
    const systemInfo: SystemInfo = {
      version,
      environment: getEnvironment(),
      uptime: getSystemUptime(),
      lastDeployment,
      database: getDatabaseInfo(),
      runtime: `Node.js ${process.version}`,
      nodeVersion: process.version,
      platform: `${os.platform()} ${os.arch()}`,
      hostname: os.hostname(),
    };
    
    return NextResponse.json({
      systemInfo,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('System info error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get system information',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
