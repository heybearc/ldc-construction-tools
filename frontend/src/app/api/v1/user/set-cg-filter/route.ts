import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only SUPER_ADMIN can set CG filter
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Only SUPER_ADMIN can filter by CG' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { constructionGroupId } = body;

    // Set cookie for CG filter (null means "All CGs")
    const cookieStore = await cookies();
    
    if (constructionGroupId) {
      cookieStore.set('cg_filter', constructionGroupId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    } else {
      cookieStore.delete('cg_filter');
    }

    return NextResponse.json({
      success: true,
      message: constructionGroupId 
        ? 'CG filter set successfully' 
        : 'CG filter cleared - showing all CGs',
    });
  } catch (error) {
    console.error('Failed to set CG filter:', error);
    return NextResponse.json(
      {
        error: 'Failed to set CG filter',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
