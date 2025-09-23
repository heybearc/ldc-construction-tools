import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  console.log('Volunteers API route called:', request.url);
  
  try {
    const users = await prisma.user.findMany({
      include: {
        accounts: true,
        sessions: true
      }
    });

    console.log('Users fetched from database:', users.length);
    return NextResponse.json(users);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch volunteers', details: error instanceof Error ? error.message : 'Database error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        role: body.role || 'READ_ONLY'
      }
    });

    console.log('User created:', user);
    return NextResponse.json(user);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create user', details: error instanceof Error ? error.message : 'Database error' },
      { status: 500 }
    );
  }
}
