import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Mock cache items (in a real implementation, you'd return actual cached items)
    const items = [
      {
        key: 'volunteers:list',
        size: '2.3 MB',
        created: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        accessed: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        hits: 145
      },
      {
        key: 'trade-teams:overview',
        size: '1.8 MB',
        created: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        accessed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        hits: 89
      },
      {
        key: 'construction-groups:list',
        size: '512 KB',
        created: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        accessed: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        hits: 234
      }
    ];

    return NextResponse.json({
      success: true,
      items
    });
  } catch (error) {
    console.error('Error getting cache items:', error);
    return NextResponse.json(
      { error: 'Failed to get cache items' },
      { status: 500 }
    );
  }
}
