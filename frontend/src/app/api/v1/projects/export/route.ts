import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import ExcelJS from 'exceljs';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'excel';

    const projects = await prisma.project.findMany({
      orderBy: { name: 'asc' },
    });

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Projects');

      worksheet.columns = [
        { header: 'Project Name', key: 'name', width: 30 },
        { header: 'Project Number', key: 'projectNumber', width: 15 },
        { header: 'Site Address', key: 'siteAddress', width: 30 },
        { header: 'City', key: 'city', width: 20 },
        { header: 'State', key: 'state', width: 10 },
        { header: 'ZIP', key: 'zip', width: 10 },
        { header: 'Project Type', key: 'projectType', width: 20 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Start Date', key: 'startDate', width: 15 },
        { header: 'Target Completion', key: 'targetCompletionDate', width: 15 },
        { header: 'Notes', key: 'notes', width: 40 },
      ];

      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

      projects.forEach((project) => {
        worksheet.addRow({
          name: project.name,
          projectNumber: project.projectNumber || '',
          siteAddress: project.siteAddress || '',
          city: project.city || '',
          state: project.state || '',
          zip: project.zip || '',
          projectType: project.projectType || '',
          status: project.status || '',
          startDate: project.startDate ? project.startDate.toISOString().split('T')[0] : '',
          targetCompletionDate: project.targetCompletionDate ? project.targetCompletionDate.toISOString().split('T')[0] : '',
          notes: project.notes || '',
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      
      const filename = `projects-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
  } catch (error: any) {
    console.error('Project export error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
