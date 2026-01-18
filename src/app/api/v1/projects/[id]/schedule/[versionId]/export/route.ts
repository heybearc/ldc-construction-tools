import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import * as XLSX from 'xlsx';

// Trade team colors for Excel (ARGB format)
const TRADE_TEAM_COLORS: Record<string, string> = {
  'Electrical': 'FFFEF3C7',    // yellow-100
  'Exteriors': 'FFFFEDD5',     // orange-100
  'Interiors': 'FFF3E8FF',     // purple-100
  'Mechanical': 'FFF3F4F6',    // gray-100
  'Plumbing': 'FFDBEAFE',      // blue-100
  'Site Support': 'FFFEF3C7',  // amber-100
  'Sitework/Civil': 'FFF5F5F4', // stone-100
  'Structural': 'FFFEE2E2',    // red-100
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      select: { name: true, projectNumber: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const version = await prisma.projectScheduleVersion.findUnique({
      where: { id: params.versionId },
      include: {
        entries: {
          where: { isActive: true },
          include: { tradeTeam: true, crew: true },
          orderBy: { startDate: 'asc' },
        },
      },
    });

    if (!version) {
      return NextResponse.json({ error: 'Schedule version not found' }, { status: 404 });
    }

    const wb = XLSX.utils.book_new();

    // === SHEET 1: Calendar/Gantt View ===
    if (version.entries.length > 0) {
      // Find date range
      const dates = version.entries.flatMap(e => [new Date(e.startDate), new Date(e.endDate)]);
      const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
      const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
      
      // Start from beginning of the week containing minDate
      const startDate = new Date(minDate);
      startDate.setDate(startDate.getDate() - startDate.getDay());
      
      // End at end of week containing maxDate
      const endDate = new Date(maxDate);
      endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

      // Generate all dates in range
      const allDates: Date[] = [];
      const current = new Date(startDate);
      while (current <= endDate) {
        allDates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }

      // Build calendar data
      const calendarData: (string | number)[][] = [];
      
      // Header row 1: Month names
      const monthRow: string[] = ['Trade Team', 'Event', 'Count'];
      let lastMonth = '';
      allDates.forEach(d => {
        const monthName = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        monthRow.push(monthName !== lastMonth ? monthName : '');
        lastMonth = monthName;
      });
      calendarData.push(monthRow);

      // Header row 2: Day numbers
      const dayRow: (string | number)[] = ['', '', ''];
      allDates.forEach(d => dayRow.push(d.getDate()));
      calendarData.push(dayRow);

      // Header row 3: Day names
      const dayNameRow: string[] = ['', '', ''];
      const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      allDates.forEach(d => dayNameRow.push(dayNames[d.getDay()]));
      calendarData.push(dayNameRow);

      // Entry rows
      version.entries.forEach(entry => {
        const row: (string | number)[] = [
          entry.tradeTeam?.name || '',
          entry.eventName,
          entry.volunteerCount || '',
        ];
        
        const entryStart = new Date(entry.startDate);
        const entryEnd = new Date(entry.endDate);
        entryStart.setHours(0, 0, 0, 0);
        entryEnd.setHours(23, 59, 59, 999);

        allDates.forEach(d => {
          const checkDate = new Date(d);
          checkDate.setHours(12, 0, 0, 0);
          if (checkDate >= entryStart && checkDate <= entryEnd) {
            row.push('█'); // Filled cell marker
          } else {
            row.push('');
          }
        });
        
        calendarData.push(row);
      });

      const wsCalendar = XLSX.utils.aoa_to_sheet(calendarData);

      // Set column widths
      wsCalendar['!cols'] = [
        { wch: 14 }, // Trade Team
        { wch: 25 }, // Event
        { wch: 6 },  // Count
        ...allDates.map(() => ({ wch: 3 })), // Date columns
      ];

      XLSX.utils.book_append_sheet(wb, wsCalendar, 'Calendar View');
    }

    // === SHEET 2: Detailed List ===
    const listData = version.entries.map(entry => ({
      'Trade Team': entry.tradeTeam?.name || '',
      'Crew': entry.crew?.name || '',
      'Event Name': entry.eventName,
      'Start Date': new Date(entry.startDate).toLocaleDateString(),
      'End Date': new Date(entry.endDate).toLocaleDateString(),
      'Duration (Days)': Math.ceil((new Date(entry.endDate).getTime() - new Date(entry.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1,
      'Volunteer Count': entry.volunteerCount || '',
      'Notes': entry.notes || '',
    }));

    const wsList = XLSX.utils.json_to_sheet(listData);
    wsList['!cols'] = [
      { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 12 },
      { wch: 12 }, { wch: 14 }, { wch: 15 }, { wch: 40 },
    ];
    XLSX.utils.book_append_sheet(wb, wsList, 'Detailed List');

    // Generate buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const projectName = project.name.replace(/[^a-zA-Z0-9]/g, '_');
    const versionName = version.name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${projectName}_Schedule_${versionName}.xlsx`;

    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export schedule error:', error);
    return NextResponse.json({ error: 'Failed to export schedule' }, { status: 500 });
  }
}
