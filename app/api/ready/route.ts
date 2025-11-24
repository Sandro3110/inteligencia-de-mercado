import { NextResponse } from 'next/server';
import { getDb } from '@/server/db';

/**
 * Readiness Check Endpoint
 * 
 * Indicates whether the application is ready to accept traffic
 * Used by Kubernetes/Docker for readiness probes
 */
export async function GET() {
  try {
    // Check if database is accessible
    const db = getDb();
    await db.execute('SELECT 1');

    return NextResponse.json(
      {
        status: 'ready',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
