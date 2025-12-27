import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth-helpers';
import { sendEmail, generateFeedbackCommentEmail } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!isAdmin(session)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email || '' }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { content, screenshots = [] } = body;

    if (!content?.trim()) {
      return NextResponse.json({ success: false, error: 'Comment content is required' }, { status: 400 });
    }

    // Get feedback with submitter info
    const feedback = await prisma.feedback.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!feedback) {
      return NextResponse.json({ success: false, error: 'Feedback not found' }, { status: 404 });
    }

    const comment = await prisma.feedbackComment.create({
      data: {
        feedbackId: params.id,
        authorId: user.id,
        content: content.trim(),
        attachments: {
          create: screenshots.map((screenshot: string, index: number) => ({
            filename: `screenshot-${index + 1}.png`,
            fileData: screenshot,
            fileSize: screenshot.length,
            mimeType: 'image/png'
          }))
        }
      }
    });

    // Send email notification to feedback submitter
    if (feedback.user?.email && feedback.user.email !== user.email) {
      try {
        const emailHtml = generateFeedbackCommentEmail(
          feedback.title,
          content.trim(),
          user.name || 'Admin',
          feedback.id,
          feedback.user.name || 'User'
        );

        await sendEmail({
          to: feedback.user.email,
          subject: `New Comment on Your Feedback: ${feedback.title}`,
          html: emailHtml
        });
      } catch (emailError) {
        console.error('Failed to send comment notification email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ success: true, data: comment });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ success: false, error: 'Failed to add comment' }, { status: 500 });
  }
}
