import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
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

    // Get user's feedback items that have been updated since they last checked
    const userFeedback = await prisma.feedback.findMany({
      where: {
        submittedBy: user.id
      },
      include: {
        comments: {
          where: {
            authorId: { not: user.id } // Only comments from others
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          include: {
            author: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Find feedback with recent updates (status changes or new comments)
    const updates = userFeedback
      .filter(feedback => {
        // Check if there are new comments
        if (feedback.comments.length > 0) {
          return true;
        }
        // Check if status was recently changed (within last 7 days)
        const daysSinceUpdate = (Date.now() - feedback.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceUpdate < 7 && feedback.status !== 'NEW';
      })
      .map(feedback => ({
        id: feedback.id,
        title: feedback.title,
        status: feedback.status,
        updatedAt: feedback.updatedAt,
        hasNewComment: feedback.comments.length > 0,
        latestCommentAuthor: feedback.comments[0]?.author.name || null
      }));

    return NextResponse.json({
      success: true,
      data: {
        updates,
        count: updates.length
      }
    });
  } catch (error) {
    console.error('Error fetching feedback updates:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch updates' }, { status: 500 });
  }
}
