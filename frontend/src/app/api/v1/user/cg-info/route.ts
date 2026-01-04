import { NextRequest, NextResponse } from 'next/server';
import { getCGScope } from '@/lib/cg-scope';

export async function GET(request: NextRequest) {
  try {
    const scope = await getCGScope();
    
    if (!scope) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // If super admin with no CG filter, show generic message
    if (scope.canViewAllBranches && !scope.constructionGroupId) {
      return NextResponse.json({
        name: 'All Construction Groups',
        regionName: 'All Regions'
      });
    }

    // If no CG assigned at all
    if (!scope.constructionGroupId) {
      return NextResponse.json({
        name: 'No Construction Group',
        regionName: 'No Region'
      });
    }

    // Get the CG info (respects CG filter for super admins)
    const { prisma } = await import('@/lib/prisma');
    const cg = await prisma.constructionGroup.findUnique({
      where: { id: scope.constructionGroupId },
      include: {
        region: true
      }
    });

    if (!cg) {
      return NextResponse.json({
        name: 'No Construction Group',
        regionName: 'No Region'
      });
    }

    return NextResponse.json({
      name: cg.name,
      regionName: cg.region?.name || cg.name
    });

  } catch (error) {
    console.error('CG info error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CG info' },
      { status: 500 }
    );
  }
}
