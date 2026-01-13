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
    // Query HAProxy HTTP stats endpoint (industry standard approach)
    const response = await fetch('http://10.92.3.26:8404/stats;csv', {
      headers: {
        'Authorization': 'Basic ' + Buffer.from('admin:Cloudy_92!').toString('base64')
      },
      signal: AbortSignal.timeout(2000)
    });
    
    if (!response.ok) {
      return null;
    }
    
    const csvData = await response.text();
    const lines = csvData.split('\n');
    
    // Parse CSV to find which backend is receiving traffic
    // CSV format: pxname,svname,qcur,qmax,scur,smax,slim,stot,...,status,...
    // scur (index 4) = current sessions - indicates which backend is actively serving traffic
    
    // First pass: check for backends with recent traffic (stot > 0)
    let greenTotal = 0;
    let blueTotal = 0;
    
    for (const line of lines) {
      if (line.startsWith('#') || !line.trim()) continue;
      
      const fields = line.split(',');
      const pxname = fields[0];
      const svname = fields[1];
      const stot = parseInt(fields[7]) || 0; // Total sessions
      
      // Check BACKEND lines for total sessions
      if (pxname === 'ldc-tools-green' && svname === 'BACKEND') {
        greenTotal = stot;
      }
      if (pxname === 'ldc-tools-blue' && svname === 'BACKEND') {
        blueTotal = stot;
      }
    }
    
    // The backend with more total sessions is the active one
    if (greenTotal > blueTotal && greenTotal > 0) {
      return 'GREEN';
    }
    if (blueTotal > greenTotal && blueTotal > 0) {
      return 'BLUE';
    }
    
    // Fallback: if no active sessions, check which backend is UP (both might be up but idle)
    for (const line of lines) {
      if (line.startsWith('#') || !line.trim()) continue;
      
      const fields = line.split(',');
      const pxname = fields[0];
      const svname = fields[1];
      const status = fields[17];
      
      // Return the first UP backend found (checking BACKEND summary line)
      if (pxname === 'ldc-tools-green' && svname === 'BACKEND' && status === 'UP') {
        return 'GREEN';
      }
      if (pxname === 'ldc-tools-blue' && svname === 'BACKEND' && status === 'UP') {
        return 'BLUE';
      }
    }
  } catch (error) {
    // HAProxy query failed, will fall back to state file
    console.error('HAProxy query failed:', error);
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
    
    // Determine LIVE/STANDBY status - use state file as primary source
    // The state file is updated by the MCP deployment tool during traffic switches
    let status: 'LIVE' | 'STANDBY' = 'STANDBY';
    let statusSource = 'default';
    
    // Primary source: Read deployment state file (updated by MCP tool)
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
      // Fallback: Try HAProxy query if state file unavailable
      const haproxyLiveServer = await queryHAProxyStatus();
      if (haproxyLiveServer) {
        status = haproxyLiveServer === server ? 'LIVE' : 'STANDBY';
        statusSource = 'haproxy-fallback';
      } else if (process.env.SERVER_STATUS) {
        // Last resort: Environment variable
        status = process.env.SERVER_STATUS as 'LIVE' | 'STANDBY';
        statusSource = 'env';
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
