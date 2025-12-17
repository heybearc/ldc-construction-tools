import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { getCGScope } from '@/lib/cg-scope';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cgScope = await getCGScope();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'volunteers';

    if (type === 'volunteers') {
      const volunteers = await prisma.volunteer.findMany({
        where: {
          constructionGroupId: cgScope.constructionGroupId,
          isActive: true,
        },
        include: {
          crew: {
            include: {
              tradeTeam: true,
            },
          },
        },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      });

      const data = volunteers.map(v => ({
        'First Name': v.firstName,
        'Last Name': v.lastName,
        'BA ID': v.baId || '',
        'Role': v.role,
        'Trade Team': v.crew?.tradeTeam?.name || '',
        'Trade Crew': v.crew?.name || '',
        'Phone': v.phone || '',
        'Personal Email': v.emailPersonal || '',
        'JW Email': v.emailJw || '',
        'Congregation': v.congregation || '',
        'Serving As': v.servingAs?.join(', ') || '',
        'Is Overseer': v.isOverseer ? 'Yes' : 'No',
        'Is Assistant': v.isAssistant ? 'Yes' : 'No',
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      
      ws['!cols'] = [
        { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 25 },
        { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 25 },
        { wch: 25 }, { wch: 20 }, { wch: 30 }, { wch: 10 }, { wch: 10 },
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Volunteers');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      return new NextResponse(buf, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="volunteers-export.xlsx"',
        },
      });
    }

    return NextResponse.json({ error: 'Unknown export type' }, { status: 400 });
  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json(
      { error: 'Failed to export data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
