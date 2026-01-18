// API route for multi-tenant hierarchy management
// GET: Fetch hierarchy data (branches, zones, regions, CGs)
// Used by admin UI for hierarchy management and CG selector

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { isAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { getCGScope } from '@/lib/cg-scope';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!isAdmin(session)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const cgScope = await getCGScope();
    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type') || 'all';

    // Fetch based on type requested
    if (type === 'branches' || type === 'all') {
      const branches = await prisma.branch.findMany({
        where: { isActive: true },
        include: {
          zones: {
            where: { isActive: true },
            orderBy: { code: 'asc' },
          },
        },
        orderBy: { code: 'asc' },
      });

      if (type === 'branches') {
        return NextResponse.json({ branches });
      }
    }

    if (type === 'zones' || type === 'all') {
      // Filter zones based on user's scope
      const zoneWhere: any = { isActive: true };
      if (cgScope && !cgScope.canViewAllBranches && cgScope.zoneId) {
        zoneWhere.id = cgScope.zoneId;
      }

      const zones = await prisma.zone.findMany({
        where: zoneWhere,
        include: {
          branch: true,
          regions: {
            where: { isActive: true },
            orderBy: { code: 'asc' },
          },
        },
        orderBy: { code: 'asc' },
      });

      if (type === 'zones') {
        return NextResponse.json({ zones });
      }
    }

    if (type === 'regions' || type === 'all') {
      // Filter regions based on user's scope
      const regionWhere: any = { isActive: true };
      if (cgScope && !cgScope.canViewAllBranches) {
        if (cgScope.canViewZoneRegions && cgScope.zoneId) {
          regionWhere.zoneId = cgScope.zoneId;
        } else if (cgScope.regionId) {
          regionWhere.id = cgScope.regionId;
        }
      }

      const regions = await prisma.region.findMany({
        where: regionWhere,
        include: {
          zone: {
            include: { branch: true },
          },
          constructionGroups: {
            where: { isActive: true },
            orderBy: { code: 'asc' },
          },
        },
        orderBy: { code: 'asc' },
      });

      if (type === 'regions') {
        return NextResponse.json({ regions });
      }
    }

    if (type === 'construction-groups' || type === 'cgs' || type === 'all') {
      // Filter CGs based on user's scope
      const cgWhere: any = { isActive: true };
      if (cgScope && !cgScope.canViewAllBranches) {
        if (cgScope.canViewZoneRegions && cgScope.zoneId) {
          cgWhere.region = { zoneId: cgScope.zoneId };
        } else if (cgScope.constructionGroupId) {
          cgWhere.id = cgScope.constructionGroupId;
        }
      }

      const constructionGroups = await prisma.constructionGroup.findMany({
        where: cgWhere,
        include: {
          region: {
            include: {
              zone: {
                include: { branch: true },
              },
            },
          },
          _count: {
            select: {
              users: true,
              tradeTeams: true,
              crews: true,
              projects: true,
            },
          },
        },
        orderBy: { code: 'asc' },
      });

      if (type === 'construction-groups' || type === 'cgs') {
        return NextResponse.json({ constructionGroups });
      }
    }

    // Return all hierarchy data
    const branches = await prisma.branch.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
    });

    const zones = await prisma.zone.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
    });

    const regions = await prisma.region.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
    });

    const constructionGroups = await prisma.constructionGroup.findMany({
      where: { isActive: true },
      include: {
        region: {
          include: {
            zone: true,
          },
        },
        _count: {
          select: {
            users: true,
            tradeTeams: true,
            projects: true,
          },
        },
      },
      orderBy: { code: 'asc' },
    });

    return NextResponse.json({
      branches,
      zones,
      regions,
      constructionGroups,
      scope: cgScope ? {
        constructionGroupId: cgScope.constructionGroupId,
        canViewAllBranches: cgScope.canViewAllBranches,
        canViewZoneRegions: cgScope.canViewZoneRegions,
      } : null,
    });

  } catch (error) {
    console.error('Hierarchy API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hierarchy data' },
      { status: 500 }
    );
  }
}
