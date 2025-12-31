import { NextResponse } from 'next/server';
import os from 'os';

export async function GET() {
  try {
    // Get the server's hostname to determine which server we're on
    const hostname = os.hostname();
    
    // Determine server based on environment or hostname
    // Container 133 (BLUE) = 10.92.3.23
    // Container 135 (GREEN) = 10.92.3.25
    
    let server: 'BLUE' | 'GREEN' = 'BLUE';
    let container = 133;
    let ip = '10.92.3.23';
    
    // Check if we can determine from hostname or environment
    if (hostname.includes('135') || process.env.SERVER_NAME === 'GREEN') {
      server = 'GREEN';
      container = 135;
      ip = '10.92.3.25';
    } else if (hostname.includes('133') || process.env.SERVER_NAME === 'BLUE') {
      server = 'BLUE';
      container = 133;
      ip = '10.92.3.23';
    }
    
    // Try to determine if this is LIVE or STANDBY by checking HAProxy
    // This is a simple heuristic - in production you'd query HAProxy stats
    let status: 'LIVE' | 'STANDBY' = 'STANDBY';
    
    // Check if we're receiving production traffic (simple heuristic)
    // In a real setup, you'd query HAProxy or check a shared state
    try {
      const response = await fetch('http://10.92.3.26:8404/stats;csv', {
        signal: AbortSignal.timeout(1000)
      });
      
      if (response.ok) {
        const stats = await response.text();
        // Parse HAProxy stats to determine which backend is active
        if (stats.includes('ldc-tools-green') && stats.includes('UP')) {
          status = server === 'GREEN' ? 'LIVE' : 'STANDBY';
        } else if (stats.includes('ldc-tools-blue') && stats.includes('UP')) {
          status = server === 'BLUE' ? 'LIVE' : 'STANDBY';
        }
      }
    } catch (error) {
      // If we can't reach HAProxy, use environment variable as fallback
      if (process.env.SERVER_STATUS) {
        status = process.env.SERVER_STATUS as 'LIVE' | 'STANDBY';
      }
    }
    
    return NextResponse.json({
      server,
      status,
      ip,
      container,
      hostname
    });
  } catch (error) {
    console.error('Error getting server info:', error);
    return NextResponse.json(
      { error: 'Failed to get server info' },
      { status: 500 }
    );
  }
}
