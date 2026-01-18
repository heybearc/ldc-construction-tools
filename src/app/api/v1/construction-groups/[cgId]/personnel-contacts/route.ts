// API route for Personnel Contact management (CG-level)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PERSONNEL_CONTACT_CONFIG, validateRoleLimit } from '@/lib/oversight-types';

// GET: List all personnel contacts for a construction group
export async function GET(
  request: NextRequest,
  { params }: { params: { cgId: string } }
) {
  try {
    const { cgId } = params;

    const contacts = await prisma.personnelContact.findMany({
      where: { constructionGroupId: cgId, isActive: true },
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
      },
      orderBy: [
        { role: 'asc' },
        { startDate: 'asc' }
      ]
    });

    const grouped = {
      PC: contacts.filter(c => c.role === 'PC'),
      PCA: contacts.filter(c => c.role === 'PCA'),
      PC_SUPPORT: contacts.filter(c => c.role === 'PC_SUPPORT')
    };

    return NextResponse.json({
      contacts,
      grouped,
      config: PERSONNEL_CONTACT_CONFIG
    });

  } catch (error) {
    console.error('Personnel Contacts GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personnel contacts' },
      { status: 500 }
    );
  }
}

// POST: Add a new personnel contact
export async function POST(
  request: NextRequest,
  { params }: { params: { cgId: string } }
) {
  try {
    const { cgId } = params;
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId and role are required' },
        { status: 400 }
      );
    }

    if (!PERSONNEL_CONTACT_CONFIG[role as keyof typeof PERSONNEL_CONTACT_CONFIG]) {
      return NextResponse.json(
        { error: `Invalid role: ${role}. Valid roles: PC, PCA, PC_SUPPORT` },
        { status: 400 }
      );
    }

    const currentCount = await prisma.personnelContact.count({
      where: { constructionGroupId: cgId, role, isActive: true }
    });

    const validation = validateRoleLimit(PERSONNEL_CONTACT_CONFIG, role, currentCount);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }

    const existing = await prisma.personnelContact.findFirst({
      where: { constructionGroupId: cgId, userId, role, isActive: true }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'User already has this role for this Construction Group' },
        { status: 409 }
      );
    }

    const contact = await prisma.personnelContact.create({
      data: {
        constructionGroupId: cgId,
        userId,
        role,
        isActive: true,
        startDate: new Date()
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

    console.log(`✅ Added ${role} to CG ${cgId}: ${userId}`);
    return NextResponse.json(contact, { status: 201 });

  } catch (error) {
    console.error('Personnel Contacts POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create personnel contact' },
      { status: 500 }
    );
  }
}
