import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { isAdmin } from '@/lib/auth-helpers';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!isAdmin(session)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Get list of backups with details from NFS storage
    const { stdout: backupList } = await execAsync(
      'ssh -o StrictHostKeyChecking=no root@10.92.3.21 "ls -lh /mnt/data/ldc-tools-backups/database/automated/db-ldc-tools-*.sql.gz 2>/dev/null | tail -10"'
    );

    // Parse backup list
    const backups = backupList.trim().split('\n').filter(line => line).map(line => {
      const parts = line.split(/\s+/);
      const size = parts[4];
      const date = `${parts[5]} ${parts[6]} ${parts[7]}`;
      const filename = parts[8]?.split('/').pop() || '';
      return { filename, size, date };
    }).reverse(); // Most recent first

    // Get last backup time
    const lastBackup = backups.length > 0 ? backups[0] : null;

    // Get database size
    const { stdout: dbSizes } = await execAsync(
      'ssh -o StrictHostKeyChecking=no root@10.92.3.21 "sudo -u postgres psql -t -c \\"SELECT pg_database.datname, pg_size_pretty(pg_database_size(pg_database.datname)) FROM pg_database WHERE datname = \'ldc_tools\';\\""'
    );

    const databases = dbSizes.trim().split('\n').filter(line => line.trim()).map(line => {
      const [name, size] = line.trim().split('|').map(s => s.trim());
      return { name, size };
    });

    return NextResponse.json({
      success: true,
      backups,
      lastBackup,
      databases,
      backupCount: backups.length
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
