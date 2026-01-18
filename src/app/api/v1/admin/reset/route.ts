import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { isAdmin } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(await isAdmin(session))) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    // Reset volunteers table (soft delete all)
    const result = await prisma.volunteer.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    return NextResponse.json({ 
      success: true, 
      message: `Reset complete. ${result.count} volunteers deactivated.` 
    });
  } catch (error) {
    console.error('Reset API error:', error);
    return NextResponse.json(
      { error: 'Failed to reset database', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
