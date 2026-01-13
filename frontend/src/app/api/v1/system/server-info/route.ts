import { NextResponse } from 'next/server';
import os from 'os';
import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

// Force dynamic rendering - do not cache this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const execAsync = promisify(exec);
const STATE_FILE = '/opt/ldc-construction-tools/deployment-state.json';

// Query HAProxy to determine which backend is live
async function queryHAProxyStatus(): Promise<'BLUE' | 'GREEN' | null> {
  try {
    // Query HAProxy stats to see which backend is active for ldc-tools
    const { stdout } = await execAsync(
      'echo "show stat" | socat stdio tcp4-connect:10.92.3.26:9999 2>/dev/null | grep "ldc-tools" | grep -v "#" || echo ""',
      { timeout: 2000 }
    );
    
    // Parse HAProxy stats to find which backend has status UP and is receiving traffic
    if (stdout.includes('ldc-tools-green') && stdout.includes('UP')) {
      return 'GREEN';
    } else if (stdout.includes('ldc-tools-blue') && stdout.includes('UP')) {
      return 'BLUE';
    }
  } catch (error) {
    // HAProxy query failed, will fall back to state file
  }
  return null;
}

export async function GET() {
  try {
    // Determine which server we're on by checking local IP
    let server: 'BLUE' | 'GREEN' = 'BLUE';
    let container = 133;
    let ip = '10.92.3.23';
    
    try {
      const { stdout } = await execAsync('hostname -I 2>/dev/null || hostname -i 2>/dev/null');
      const localIp = stdout.trim().split(' ')[0];
      
      if (localIp.includes('10.92.3.25')) {
        server = 'GREEN';
        container = 135;
        ip = '10.92.3.25';
      } else if (localIp.includes('10.92.3.23')) {
        server = 'BLUE';
        container = 133;
        ip = '10.92.3.23';
      }
    } catch (error) {
      // Fallback to environment variable if IP detection fails
      if (process.env.SERVER_NAME === 'GREEN') {
        server = 'GREEN';
        container = 135;
        ip = '10.92.3.25';
      }
    }
    
    // Determine LIVE/STANDBY status - try multiple sources in order of reliability
    let status: 'LIVE' | 'STANDBY' = 'STANDBY';
    let statusSource = 'default';
    
    // 1. First try: Query HAProxy directly (most reliable)
    const haproxyLiveServer = await queryHAProxyStatus();
    if (haproxyLiveServer) {
      status = haproxyLiveServer === server ? 'LIVE' : 'STANDBY';
      statusSource = 'haproxy';
    } else {
      // 2. Second try: Read deployment state file
      try {
        const stateData = await fs.readFile(STATE_FILE, 'utf-8');
        const state = JSON.parse(stateData);
        
        if (state.liveServer === server) {
          status = 'LIVE';
          statusSource = 'statefile';
        } else {
          status = 'STANDBY';
          statusSource = 'statefile';
        }
      } catch (error) {
        // 3. Third try: Environment variable
        if (process.env.SERVER_STATUS) {
          status = process.env.SERVER_STATUS as 'LIVE' | 'STANDBY';
          statusSource = 'env';
        }
      }
    }
    
    return NextResponse.json({
      server,
      status,
      ip,
      container,
      hostname: os.hostname(),
      statusSource // For debugging
    });
  } catch (error) {
    console.error('Error getting server info:', error);
    return NextResponse.json(
      { error: 'Failed to get server info' },
      { status: 500 }
    );
  }
}
