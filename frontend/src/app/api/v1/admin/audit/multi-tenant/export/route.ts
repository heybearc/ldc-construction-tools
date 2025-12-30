import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { getCGScope } from '@/lib/cg-scope';

// GET - Export audit logs to CSV
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to export audit logs
    const cgScope = await getCGScope();
    if (!cgScope?.canViewAllBranches) {
      return NextResponse.json(
        { error: 'Insufficient permissions - SUPER_ADMIN required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Parse query parameters (same as GET endpoint)
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    const resource = searchParams.get('resource');
    const constructionGroupId = searchParams.get('constructionGroupId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (action) {
      where.action = action;
    }

    if (resource) {
      where.resource = resource;
    }

    if (constructionGroupId) {
      where.OR = [
        { fromConstructionGroupId: constructionGroupId },
        { toConstructionGroupId: constructionGroupId }
      ];
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = new Date(startDate);
      }
      if (endDate) {
        where.timestamp.lte = new Date(endDate);
      }
    }

    // Fetch all matching audit logs (no pagination for export)
    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        },
        fromConstructionGroup: {
          select: {
            code: true,
            name: true
          }
        },
        toConstructionGroup: {
          select: {
            code: true,
            name: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    // Generate CSV content
    const headers = [
      'Timestamp',
      'User Name',
      'User Email',
      'User Role',
      'Action',
      'Resource',
      'Resource ID',
      'From CG Code',
      'From CG Name',
      'To CG Code',
      'To CG Name',
      'IP Address',
      'User Agent',
      'Metadata'
    ];

    const csvRows = [headers.join(',')];

    for (const log of logs) {
      const row = [
        log.timestamp.toISOString(),
        `"${log.user?.name || 'Unknown'}"`,
        `"${log.user?.email || 'Unknown'}"`,
        log.user?.role || 'Unknown',
        log.action,
        log.resource,
        log.resourceId || '',
        log.fromConstructionGroup?.code || '',
        `"${log.fromConstructionGroup?.name || ''}"`,
        log.toConstructionGroup?.code || '',
        `"${log.toConstructionGroup?.name || ''}"`,
        log.ipAddress || '',
        `"${log.userAgent || ''}"`,
        log.metadata ? `"${JSON.stringify(log.metadata).replace(/"/g, '""')}"` : ''
      ];
      csvRows.push(row.join(','));
    }

    const csv = csvRows.join('\n');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `audit-logs-${timestamp}.csv`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Export audit logs error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to export audit logs',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
