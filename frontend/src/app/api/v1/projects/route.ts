import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';;


export async function GET(request: NextRequest) {
  console.log('Projects API route called:', request.url);
  
  try {
    const projects = await prisma.project.findMany({
      include: {
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                firstName: true,
                lastName: true
              }
            },
            role: {
              select: {
                id: true,
                name: true,
                displayName: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('Projects fetched from database:', projects.length);
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects', details: error instanceof Error ? error.message : 'Database error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const project = await prisma.project.create({
      data: {
        name: body.name,
        description: body.description,
        status: body.status || 'PLANNING',
        priority: body.priority || 'MEDIUM',
        regionId: body.regionId || '01.12',
        zoneId: body.zoneId,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        estimatedDuration: body.estimatedDuration,
        budget: body.budget,
        projectManager: body.projectManager
      },
      include: {
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                firstName: true,
                lastName: true
              }
            },
            role: {
              select: {
                id: true,
                name: true,
                displayName: true
              }
            }
          }
        }
      }
    });

    console.log('Project created:', project);
    return NextResponse.json(project);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create project', details: error instanceof Error ? error.message : 'Database error' },
      { status: 500 }
    );
  }
}
