import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all requests where user's email matches requestorEmail
    const requests = await prisma.crewChangeRequest.findMany({
      where: {
        requestorEmail: session.user.email || ''
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        completedBy: {
          select: {
            id: true,
            name: true
          }
        },
        constructionGroup: {
          select: {
            id: true,
            code: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      requests
    });

  } catch (error) {
    console.error('Get my requests error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
