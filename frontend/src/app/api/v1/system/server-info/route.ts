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

// Query HAProxy config to determine which backend is active
async function queryHAProxyConfig(): Promise<'BLUE' | 'GREEN' | null> {
  try {
    // SSH to HAProxy and read the config file to see which backend is configured
    // Look for the main routing line: "use_backend ldc-tools-X if is_ldc" (not is_ldc_blue/is_ldc_green)
    const { stdout } = await execAsync(
      'ssh -o ConnectTimeout=2 -o StrictHostKeyChecking=no -i ~/.ssh/id_rsa root@10.92.3.26 "grep \'use_backend ldc-tools.*if is_ldc$\' /etc/haproxy/haproxy.cfg"',
      { timeout: 3000 }
    );
    
    // Parse the line: "use_backend ldc-tools-green if is_ldc" or "use_backend ldc-tools-blue if is_ldc"
    if (stdout.includes('ldc-tools-green')) {
      return 'GREEN';
    } else if (stdout.includes('ldc-tools-blue')) {
      return 'BLUE';
    }
  } catch (error) {
    console.error('HAProxy config query failed:', error);
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
    
    // Determine LIVE/STANDBY status - HAProxy config is source of truth
    let status: 'LIVE' | 'STANDBY' = 'STANDBY';
    let statusSource = 'default';
    
    // Primary: Query HAProxy config file (actual routing configuration)
    const haproxyLiveServer = await queryHAProxyConfig();
    if (haproxyLiveServer) {
      status = haproxyLiveServer === server ? 'LIVE' : 'STANDBY';
      statusSource = 'haproxy-config';
    } else {
      // Fallback: Read state file (updated by MCP tool alongside HAProxy)
      try {
        const stateData = await fs.readFile(STATE_FILE, 'utf-8');
        const state = JSON.parse(stateData);
        
        status = state.liveServer === server ? 'LIVE' : 'STANDBY';
        statusSource = 'statefile-fallback';
      } catch (error) {
        // Last resort: Environment variable
        if (process.env.SERVER_STATUS) {
          status = process.env.SERVER_STATUS as 'LIVE' | 'STANDBY';
          statusSource = 'env';
        }
        console.error('Failed to determine status:', error);
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
