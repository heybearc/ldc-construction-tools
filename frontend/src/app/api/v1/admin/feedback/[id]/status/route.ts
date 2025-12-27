import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth-helpers';
import { sendEmail, generateFeedbackStatusChangeEmail } from '@/lib/email';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!isAdmin(session)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    const validStatuses = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    if (!validStatuses.includes(status.toUpperCase())) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    // Get current feedback with submitter info
    const currentFeedback = await prisma.feedback.findUnique({
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

    if (!currentFeedback) {
      return NextResponse.json({ success: false, error: 'Feedback not found' }, { status: 404 });
    }

    const oldStatus = currentFeedback.status;
    const newStatus = status.toUpperCase();

    const feedback = await prisma.feedback.update({
      where: { id: params.id },
      data: { status: newStatus }
    });

    // Send email notification if status changed
    if (oldStatus !== newStatus && currentFeedback.user?.email) {
      try {
        const emailHtml = generateFeedbackStatusChangeEmail(
          currentFeedback.title,
          oldStatus,
          newStatus,
          currentFeedback.id,
          currentFeedback.user.name || 'User'
        );

        await sendEmail({
          to: currentFeedback.user.email,
          subject: `Feedback Status Updated: ${currentFeedback.title}`,
          html: emailHtml
        });
      } catch (emailError) {
        console.error('Failed to send status change email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ success: true, data: feedback });
  } catch (error) {
    console.error('Error updating feedback status:', error);
    return NextResponse.json({ success: false, error: 'Failed to update status' }, { status: 500 });
  }
}
