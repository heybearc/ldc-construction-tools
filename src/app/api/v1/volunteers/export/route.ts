import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import ExcelJS from 'exceljs';
import { getUserOrgRoles, checkPermission } from '@/lib/api-permissions';
import { canExportVolunteers } from '@/lib/permissions';
import { getCGScope, withCGFilter } from '@/lib/cg-scope';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const scope = await getCGScope();
    if (!scope) {
      return NextResponse.json({ error: 'Unable to determine CG scope' }, { status: 403 });
    }

    // Check permissions - requires management role
    const userOrgRoles = await getUserOrgRoles(session);
    const permissionError = checkPermission(canExportVolunteers(session, userOrgRoles));
    if (permissionError) return permissionError;

    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'excel';
    const tradeTeam = searchParams.get('trade_team');
    const tradeCrew = searchParams.get('trade_crew');
    const role = searchParams.get('role');

    const where: any = {
      ...withCGFilter(scope),
    };
    
    if (tradeTeam) {
      where.tradeCrew = {
        tradeTeam: {
          name: tradeTeam,
        },
      };
    }
    
    if (tradeCrew) {
      where.tradeCrew = {
        name: tradeCrew,
      };
    }
    
    if (role) {
      where.role = role;
    }

    const volunteers = await prisma.user.findMany({
      where,
      include: {
        tradeCrew: {
          include: {
            tradeTeam: true,
          },
        },
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' },
      ],
    });

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Volunteers');

      worksheet.columns = [
        { header: 'First Name', key: 'firstName', width: 15 },
        { header: 'Last Name', key: 'lastName', width: 15 },
        { header: 'BA ID', key: 'baId', width: 12 },
        { header: 'Email (Personal)', key: 'emailPersonal', width: 25 },
        { header: 'Email (JW)', key: 'emailJw', width: 25 },
        { header: 'Phone', key: 'phone', width: 15 },
        { header: 'Congregation', key: 'congregation', width: 20 },
        { header: 'Role', key: 'role', width: 20 },
        { header: 'Serving As', key: 'servingAs', width: 30 },
        { header: 'Trade Team', key: 'tradeTeam', width: 20 },
        { header: 'Trade Crew', key: 'tradeCrew', width: 20 },
        { header: 'Overseer', key: 'isOverseer', width: 10 },
        { header: 'Assistant', key: 'isAssistant', width: 10 },
        { header: 'Active', key: 'isActive', width: 10 },
      ];

      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

      volunteers.forEach((volunteer) => {
        worksheet.addRow({
          firstName: volunteer.firstName,
          lastName: volunteer.lastName,
          baId: volunteer.baId || '',
          emailPersonal: volunteer.emailPersonal || '',
          emailJw: volunteer.emailJw || '',
          phone: volunteer.phone || '',
          congregation: volunteer.congregation || '',
          role: volunteer.role,
          servingAs: volunteer.servingAs?.join(', ') || '',
          tradeTeam: volunteer.tradeCrew?.tradeTeam?.name || '',
          tradeCrew: volunteer.tradeCrew?.name || '',
          isOverseer: volunteer.isOverseer ? 'Yes' : 'No',
          isAssistant: volunteer.isAssistant ? 'Yes' : 'No',
          isActive: volunteer.isActive ? 'Yes' : 'No',
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      
      const filename = `volunteers-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
  } catch (error: any) {
    console.error('Volunteer export error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
