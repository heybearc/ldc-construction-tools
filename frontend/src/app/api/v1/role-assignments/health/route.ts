import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';;


// GET /api/v1/role-assignments/health - Health check endpoint
export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();

    // Test database connectivity
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Test role assignments table
    const roleAssignmentCount = await prisma.roleAssignment.count();
    
    // Test roles table
    const roleCount = await prisma.role.count();
    
    // Test users table
    const userCount = await prisma.user.count();

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    return NextResponse.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      database: {
        connected: true,
        tables: {
          roleAssignments: roleAssignmentCount,
          roles: roleCount,
          users: userCount
        }
      },
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    });

  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      database: {
        connected: false
      }
    }, { status: 503 });
  }
}
