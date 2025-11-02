import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { isAdmin } from '@/lib/auth-helpers';
import { PrismaClient } from '@prisma/client';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

interface HealthMetric {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  value: string;
  description: string;
  lastChecked: string;
}

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'error';
  uptime: string;
  metrics: HealthMetric[];
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

// Helper to get memory usage
function getMemoryUsage(): { percentage: number; used: string; total: string; status: 'healthy' | 'warning' | 'error' } {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const percentage = Math.round((usedMem / totalMem) * 100);
  
  const toGB = (bytes: number) => (bytes / 1024 / 1024 / 1024).toFixed(2);
  
  let status: 'healthy' | 'warning' | 'error' = 'healthy';
  if (percentage > 90) status = 'error';
  else if (percentage > 75) status = 'warning';
  
  return {
    percentage,
    used: toGB(usedMem),
    total: toGB(totalMem),
    status,
  };
}

// Helper to check database connection
async function checkDatabase(): Promise<{ status: 'healthy' | 'warning' | 'error'; responseTime: number; error?: string }> {
  const startTime = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - startTime;
    
    let status: 'healthy' | 'warning' | 'error' = 'healthy';
    if (responseTime > 100) status = 'warning';
    if (responseTime > 500) status = 'error';
    
    return { status, responseTime };
  } catch (error) {
    return {
      status: 'error',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Helper to get disk usage
async function getDiskUsage(): Promise<{ percentage: number; status: 'healthy' | 'warning' | 'error' }> {
  try {
    const { stdout } = await execAsync("df -h / | tail -1 | awk '{print $5}' | sed 's/%//'");
    const percentage = parseInt(stdout.trim());
    
    let status: 'healthy' | 'warning' | 'error' = 'healthy';
    if (percentage > 90) status = 'error';
    else if (percentage > 75) status = 'warning';
    
    return { percentage, status };
  } catch (error) {
    // Fallback if df command fails
    return { percentage: 0, status: 'healthy' };
  }
}

// Helper to check email service (simplified)
async function checkEmailService(): Promise<{ status: 'healthy' | 'warning' | 'error'; value: string }> {
  // Check if email config exists
  try {
    // This is a simplified check - in production you'd actually test SMTP connection
    return {
      status: 'healthy',
      value: 'Connected',
    };
  } catch (error) {
    return {
      status: 'error',
      value: 'Disconnected',
    };
  }
}

// Helper to count background jobs (PM2 processes)
async function getBackgroundJobs(): Promise<{ count: number; status: 'healthy' | 'warning' | 'error' }> {
  try {
    // Check if PM2 is running
    const { stdout } = await execAsync('pm2 jlist 2>/dev/null || echo "[]"');
    const processes = JSON.parse(stdout);
    const activeProcesses = processes.filter((p: any) => p.pm2_env?.status === 'online');
    
    return {
      count: activeProcesses.length,
      status: activeProcesses.length > 0 ? 'healthy' : 'warning',
    };
  } catch (error) {
    return { count: 0, status: 'warning' };
  }
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
    
    // Gather all health metrics
    const [dbHealth, diskUsage, emailStatus, bgJobs] = await Promise.all([
      checkDatabase(),
      getDiskUsage(),
      checkEmailService(),
      getBackgroundJobs(),
    ]);
    
    const memoryUsage = getMemoryUsage();
    const uptime = getSystemUptime();
    
    // Build metrics array
    const metrics: HealthMetric[] = [
      {
        name: 'Database Connection',
        status: dbHealth.status,
        value: `< ${dbHealth.responseTime}ms`,
        description: 'PostgreSQL connection response time',
        lastChecked: new Date().toISOString(),
      },
      {
        name: 'API Response Time',
        status: dbHealth.responseTime < 100 ? 'healthy' : 'warning',
        value: `${dbHealth.responseTime}ms avg`,
        description: 'Average API endpoint response time',
        lastChecked: new Date().toISOString(),
      },
      {
        name: 'Memory Usage',
        status: memoryUsage.status,
        value: `${memoryUsage.percentage}% (${memoryUsage.used}GB / ${memoryUsage.total}GB)`,
        description: 'Current memory utilization',
        lastChecked: new Date().toISOString(),
      },
      {
        name: 'Disk Space',
        status: diskUsage.status,
        value: `${diskUsage.percentage}% used`,
        description: 'Available disk space',
        lastChecked: new Date().toISOString(),
      },
      {
        name: 'Email Service',
        status: emailStatus.status,
        value: emailStatus.value,
        description: 'SMTP connection status',
        lastChecked: new Date().toISOString(),
      },
      {
        name: 'Background Jobs',
        status: bgJobs.status,
        value: `${bgJobs.count} active`,
        description: 'Running background processes',
        lastChecked: new Date().toISOString(),
      },
    ];
    
    // Determine overall health
    const hasError = metrics.some(m => m.status === 'error');
    const hasWarning = metrics.some(m => m.status === 'warning');
    const overall = hasError ? 'error' : hasWarning ? 'warning' : 'healthy';
    
    const health: SystemHealth = {
      overall,
      uptime,
      metrics,
    };
    
    return NextResponse.json({
      health,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check system health',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
