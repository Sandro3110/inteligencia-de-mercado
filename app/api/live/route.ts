import { NextResponse } from 'next/server';

/**
 * Liveness Check Endpoint
 * 
 * Indicates whether the application is alive and running
 * Used by Kubernetes/Docker for liveness probes
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    { status: 200 }
  );
}
