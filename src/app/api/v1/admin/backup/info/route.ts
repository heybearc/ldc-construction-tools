import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { isAdmin } from '@/lib/auth-helpers';

// Force Node.js runtime for child_process
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Import exec dynamically to avoid bundling issues
const execAsync = async (command: string): Promise<{ stdout: string; stderr: string }> => {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execPromise = promisify(exec);
  return execPromise(command);
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!isAdmin(session)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    let backups: any[] = [];
    let lastBackup: any = null;
    let databases: any[] = [];
    let sshAvailable = true;

    try {
      // Get list of backups with details from NFS storage
      const { stdout: backupList } = await execAsync(
        'ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 root@10.92.3.21 "ls -lh /mnt/data/ldc-tools-backups/database/automated/db-ldc-tools-*.sql.gz 2>/dev/null | tail -10"'
      );

      // Parse backup list
      backups = backupList.trim().split('\n').filter(line => line).map(line => {
        const parts = line.split(/\s+/);
        const size = parts[4];
        const date = `${parts[5]} ${parts[6]} ${parts[7]}`;
        const filename = parts[8]?.split('/').pop() || '';
        return { filename, size, date };
      }).reverse(); // Most recent first

      // Get last backup time
      lastBackup = backups.length > 0 ? backups[0] : null;

      // Get database size
      const { stdout: dbSizes } = await execAsync(
        'ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 root@10.92.3.21 "sudo -u postgres psql -t -c \\"SELECT pg_database.datname, pg_size_pretty(pg_database_size(pg_database.datname)) FROM pg_database WHERE datname = \'ldc_tools\';\\""'
      );

      databases = dbSizes.trim().split('\n').filter(line => line.trim()).map(line => {
        const [name, size] = line.trim().split('|').map(s => s.trim());
        return { name, size };
      });
    } catch (sshError) {
      console.error('SSH connection to database server failed:', sshError);
      sshAvailable = false;
      // Return graceful response when SSH is not available
      databases = [{ name: 'ldc_tools', size: 'N/A (SSH unavailable)' }];
    }

    return NextResponse.json({
      success: true,
      backups,
      lastBackup,
      databases,
      backupCount: backups.length,
      sshAvailable,
      message: !sshAvailable ? 'Backup information unavailable - SSH connection to database server not configured' : undefined
    });
  } catch (error) {
    console.error('Backup info error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get backup information',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
