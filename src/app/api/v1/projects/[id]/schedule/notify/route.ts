import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { createScheduleChangeAnnouncement } from '@/lib/schedule-notifications';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { 
      scheduleVersionId, 
      changeDescription, 
      sendNotifications = false,
      notifyRoles = []
    } = body;

    if (!scheduleVersionId || !changeDescription) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: scheduleVersionId, changeDescription' 
      }, { status: 400 });
    }

    // Get project and schedule version details
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true
      }
    });

    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    const scheduleVersion = await prisma.projectScheduleVersion.findUnique({
      where: { id: scheduleVersionId },
      select: {
        id: true,
        name: true,
        projectId: true
      }
    });

    if (!scheduleVersion || scheduleVersion.projectId !== params.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Schedule version not found or does not belong to this project' 
      }, { status: 404 });
    }

    // Create announcement and send notifications
    const announcementId = await createScheduleChangeAnnouncement(
      {
        projectId: project.id,
        projectName: project.name,
        scheduleVersionId: scheduleVersion.id,
        versionName: scheduleVersion.name,
        changeDescription,
        changedBy: user.id,
        changedByName: user.name || 'Unknown'
      },
      sendNotifications,
      notifyRoles
    );

    return NextResponse.json({
      success: true,
      data: {
        announcementId,
        notificationsSent: sendNotifications,
        recipientRoles: notifyRoles
      }
    });
  } catch (error) {
    console.error('Error creating schedule change notification:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create schedule change notification' 
    }, { status: 500 });
  }
}
