import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { applyCGScope } from '@/lib/cg-scope';

// GET /api/v1/projects - List all projects (CG scoped)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {
      isActive: true,
    };

    // Apply CG scoping
    const cgScope = await applyCGScope(session.user);
    if (cgScope.constructionGroupId) {
      where.constructionGroupId = cgScope.constructionGroupId;
    } else if (cgScope.constructionGroupIds) {
      where.constructionGroupId = { in: cgScope.constructionGroupIds };
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        constructionGroup: true,
        crewAssignments: {
          where: { isActive: true },
          include: {
            crew: {
              include: {
                tradeTeam: true,
              },
            },
          },
        },
        _count: {
          select: {
            crewAssignments: { where: { isActive: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Projects API error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

// POST /api/v1/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, status, startDate, endDate, constructionGroupId } = body;

    if (!name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    // Use provided CG or default to user's CG
    const cgId = constructionGroupId || session.user.constructionGroupId;
    if (!cgId) {
      return NextResponse.json({ error: 'Construction Group is required' }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        status: status || 'PLANNING',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        constructionGroupId: cgId,
        regionId: session.user.regionId || '01.12',
      },
      include: {
        constructionGroup: true,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
