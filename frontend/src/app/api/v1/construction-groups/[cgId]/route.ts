// API route for individual Construction Group
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Fetch a single construction group with details
export async function GET(
  request: NextRequest,
  { params }: { params: { cgId: string } }
) {
  try {
    const { cgId } = params;

    const cg = await prisma.constructionGroup.findUnique({
      where: { id: cgId },
      include: {
        region: {
          include: {
            zone: {
              include: {
                branch: true
              }
            }
          }
        },
        _count: {
          select: {
            users: true,
            tradeTeams: true,
            crews: true,
            projects: true
          }
        }
      }
    });

    if (!cg) {
      return NextResponse.json(
        { error: 'Construction Group not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(cg);

  } catch (error) {
    console.error('CG GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Construction Group' },
      { status: 500 }
    );
  }
}
