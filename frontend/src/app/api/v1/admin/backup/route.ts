import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { isAdmin } from '@/lib/auth-helpers';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!isAdmin(session)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Trigger the backup script on the database server
    const { stdout, stderr } = await execAsync(
      'ssh -o StrictHostKeyChecking=no root@10.92.3.21 "/usr/local/bin/backup-ldc-tools.sh"'
    );

    // Get list of recent backups from NFS storage
    const { stdout: backupList } = await execAsync(
      'ssh -o StrictHostKeyChecking=no root@10.92.3.21 "ls -lh /mnt/data/ldc-tools-backups/database/automated/db-ldc-tools-*.sql.gz | tail -10"'
    );

    return NextResponse.json({
      success: true,
      message: 'Backup completed successfully',
      output: stdout,
      backups: backupList
    });
  } catch (error) {
    console.error('Backup error:', error);
    return NextResponse.json(
      {
        error: 'Backup failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
