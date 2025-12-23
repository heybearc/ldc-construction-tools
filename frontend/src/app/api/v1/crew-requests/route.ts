import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

// GET - List all crew change requests (for personnel team)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { constructionGroupId: true, role: true }
    });

    if (!user?.constructionGroupId) {
      return NextResponse.json({ error: 'No construction group assigned' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {
      constructionGroupId: user.constructionGroupId,
    };

    if (status && status !== 'ALL') {
      where.status = status;
    }

    const requests = await prisma.crewChangeRequest.findMany({
      where,
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true }
        },
        completedBy: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(requests.map(r => ({
      id: r.id,
      request_type: r.requestType,
      requestor_name: r.requestorName,
      requestor_email: r.requestorEmail,
      volunteer_name: r.volunteerName,
      volunteer_ba_id: r.volunteerBaId,
      trade_team_id: r.tradeTeamId,
      crew_id: r.crewId,
      crew_name: r.crewName,
      project_id: r.projectId,
      project_roster_name: r.projectRosterName,
      comments: r.comments,
      status: r.status,
      assigned_to: r.assignedTo ? {
        id: r.assignedTo.id,
        name: r.assignedTo.name,
        email: r.assignedTo.email
      } : null,
      resolution_notes: r.resolutionNotes,
      completed_at: r.completedAt?.toISOString() || null,
      completed_by: r.completedBy ? {
        id: r.completedBy.id,
        name: r.completedBy.name
      } : null,
      created_at: r.createdAt.toISOString(),
      updated_at: r.updatedAt.toISOString(),
    })));
  } catch (error) {
    console.error('Get crew requests error:', error);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}

// POST - Submit a new crew change request (requires authentication)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized - Please sign in' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, constructionGroupId: true, name: true }
    });

    if (!user?.constructionGroupId) {
      return NextResponse.json({ error: 'No construction group assigned' }, { status: 403 });
    }

    const body = await request.json();
    const {
      request_type,
      volunteer_name,
      volunteer_ba_id,
      trade_team_id,
      crew_id,
      crew_name,
      project_id,
      project_roster_name,
      comments,
      override_requestor_name,
      override_requestor_email,
    } = body;

    // Validation
    if (!request_type || !volunteer_name) {
      return NextResponse.json(
        { error: 'Request type and volunteer name are required' },
        { status: 400 }
      );
    }

    // Check if user is SUPER_ADMIN and has override fields
    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    });

    const isSuperAdmin = userRecord?.role === 'SUPER_ADMIN';
    const hasOverride = override_requestor_name && override_requestor_email;

    // Use override if provided by SUPER_ADMIN, otherwise use session user
    const requestorName = (isSuperAdmin && hasOverride) 
      ? override_requestor_name 
      : (user.name || session.user.email || 'Unknown');
    const requestorEmail = (isSuperAdmin && hasOverride)
      ? override_requestor_email
      : session.user.email;

    const newRequest = await prisma.crewChangeRequest.create({
      data: {
        requestType: request_type,
        requestorName,
        requestorEmail,
        volunteerName: volunteer_name,
        volunteerBaId: volunteer_ba_id || null,
        tradeTeamId: trade_team_id || null,
        crewId: crew_id || null,
        crewName: crew_name || null,
        projectId: project_id || null,
        projectRosterName: project_roster_name || null,
        comments: comments || null,
        status: 'NEW',
        constructionGroupId: user.constructionGroupId,
      }
    });

    // TODO: Send email notification to personnel team

    return NextResponse.json({
      id: newRequest.id,
      message: 'Request submitted successfully',
      request_type: newRequest.requestType,
      volunteer_name: newRequest.volunteerName,
      status: newRequest.status,
      created_at: newRequest.createdAt.toISOString(),
    }, { status: 201 });
  } catch (error) {
    console.error('Create crew request error:', error);
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
  }
}
