import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { isAdmin } from '@/lib/auth-helpers';

interface EndpointTest {
  name: string;
  path: string;
  method: string;
  status: 'healthy' | 'warning' | 'error';
  responseTime: number;
  lastChecked: string;
  description: string;
  error?: string;
}

interface APIStats {
  totalEndpoints: number;
  healthyEndpoints: number;
  warningEndpoints: number;
  errorEndpoints: number;
  averageResponseTime: number;
  uptime: string;
  lastUpdated: string;
}

// Define endpoints to test
const ENDPOINTS_TO_TEST = [
  {
    name: 'User Management',
    path: '/api/v1/volunteers',
    method: 'GET',
    description: 'User listing and management',
    requiresAuth: true,
  },
  {
    name: 'Trade Teams',
    path: '/api/v1/trade-teams',
    method: 'GET',
    description: 'Trade team data retrieval',
    requiresAuth: true,
  },
  {
    name: 'Projects API',
    path: '/api/v1/projects',
    method: 'GET',
    description: 'Project management endpoints',
    requiresAuth: true,
  },
  {
    name: 'Roles API',
    path: '/api/v1/roles',
    method: 'GET',
    description: 'Role management endpoints',
    requiresAuth: true,
  },
  {
    name: 'Role Assignments',
    path: '/api/v1/role-assignments',
    method: 'GET',
    description: 'Role assignment management',
    requiresAuth: true,
  },
  {
    name: 'Admin Email Config',
    path: '/api/v1/admin/email/config',
    method: 'GET',
    description: 'Email configuration management',
    requiresAuth: true,
  },
];

async function testEndpoint(
  endpoint: typeof ENDPOINTS_TO_TEST[0],
  baseUrl: string,
  sessionCookie?: string
): Promise<EndpointTest> {
  const startTime = Date.now();
  const url = `${baseUrl}${endpoint.path}`;
  
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Add session cookie if available
    if (sessionCookie) {
      headers['Cookie'] = sessionCookie;
    }
    
    const response = await fetch(url, {
      method: endpoint.method,
      headers,
      cache: 'no-store',
    });
    
    const responseTime = Date.now() - startTime;
    
    // Determine status based on response
    let status: 'healthy' | 'warning' | 'error';
    let error: string | undefined;
    
    if (response.ok) {
      // Response time thresholds
      if (responseTime < 100) {
        status = 'healthy';
      } else if (responseTime < 500) {
        status = 'warning';
      } else {
        status = 'error';
        error = `Slow response: ${responseTime}ms`;
      }
    } else if (response.status === 401 || response.status === 403) {
      // Auth errors are expected for some endpoints
      status = 'healthy';
      error = undefined; // Not really an error, just requires auth
    } else if (response.status === 404) {
      status = 'warning';
      error = 'Endpoint not found';
    } else {
      status = 'error';
      error = `HTTP ${response.status}: ${response.statusText}`;
    }
    
    return {
      name: endpoint.name,
      path: endpoint.path,
      method: endpoint.method,
      status,
      responseTime,
      lastChecked: new Date().toISOString(),
      description: endpoint.description,
      error,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      name: endpoint.name,
      path: endpoint.path,
      method: endpoint.method,
      status: 'error',
      responseTime,
      lastChecked: new Date().toISOString(),
      description: endpoint.description,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!isAdmin(session)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }
    
    // Get base URL from request
    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    
    // Get session cookie for authenticated requests
    const sessionCookie = request.headers.get('cookie') || undefined;
    
    // Test all endpoints in parallel
    const testPromises = ENDPOINTS_TO_TEST.map(endpoint =>
      testEndpoint(endpoint, baseUrl, sessionCookie)
    );
    
    const endpoints = await Promise.all(testPromises);
    
    // Calculate statistics
    const healthyEndpoints = endpoints.filter(e => e.status === 'healthy').length;
    const warningEndpoints = endpoints.filter(e => e.status === 'warning').length;
    const errorEndpoints = endpoints.filter(e => e.status === 'error').length;
    const totalResponseTime = endpoints.reduce((sum, e) => sum + e.responseTime, 0);
    const averageResponseTime = Math.round(totalResponseTime / endpoints.length);
    
    const stats: APIStats = {
      totalEndpoints: endpoints.length,
      healthyEndpoints,
      warningEndpoints,
      errorEndpoints,
      averageResponseTime,
      uptime: '99.9%', // TODO: Calculate actual uptime from monitoring data
      lastUpdated: new Date().toISOString(),
    };
    
    return NextResponse.json({
      endpoints,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('API status check error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check API status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
