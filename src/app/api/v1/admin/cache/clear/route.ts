import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { type } = body; // 'all', 'old', or 'unused'

    // In a real implementation, you would clear actual cache entries
    // For now, we'll simulate the operation
    let cleared = 0;
    
    switch (type) {
      case 'all':
        // Clear all cache entries
        cleared = 3; // Mock: cleared all items
        if (global.gc) {
          global.gc(); // Force garbage collection if available
        }
        break;
      case 'old':
        // Clear entries older than 7 days
        cleared = 1; // Mock: cleared old items
        break;
      case 'unused':
        // Clear entries not accessed in 24 hours
        cleared = 0; // Mock: no unused items
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid cache clear type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      cleared,
      type
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}
