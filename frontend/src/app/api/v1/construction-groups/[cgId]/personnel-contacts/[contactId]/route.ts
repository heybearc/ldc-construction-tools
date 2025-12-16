// API route for individual Personnel Contact
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH: Update a personnel contact
export async function PATCH(
  request: NextRequest,
  { params }: { params: { cgId: string; contactId: string } }
) {
  try {
    const { contactId } = params;
    const body = await request.json();
    const { isActive, endDate } = body;

    const contact = await prisma.personnelContact.update({
      where: { id: contactId },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return NextResponse.json(contact);

  } catch (error) {
    console.error('Personnel Contact PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update personnel contact' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a personnel contact (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { cgId: string; contactId: string } }
) {
  try {
    const { contactId } = params;

    const contact = await prisma.personnelContact.update({
      where: { id: contactId },
      data: {
        isActive: false,
        endDate: new Date()
      }
    });

    console.log(`✅ Removed personnel contact ${contactId}`);
    return NextResponse.json({ success: true, id: contact.id });

  } catch (error) {
    console.error('Personnel Contact DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete personnel contact' },
      { status: 500 }
    );
  }
}
