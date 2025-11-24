import { NextResponse } from 'next/server';
import { getMetricsSummary } from '@/lib/monitoring/metrics';

/**
 * Metrics Endpoint
 * 
 * Returns metrics summary
 * In production, this should be protected and only accessible to monitoring systems
 */
export async function GET() {
  try {
    const summary = getMetricsSummary();
    
    return NextResponse.json(
      {
        status: 'success',
        data: summary,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
