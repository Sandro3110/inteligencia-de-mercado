import { NextResponse } from 'next/server';
import { getDb } from '@/server/db';

/**
 * Health Check Endpoint
 * 
 * Returns the health status of the application and its dependencies
 */
export async function GET() {
  const startTime = Date.now();
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    checks: {
      database: 'unknown',
      memory: 'unknown',
    },
  };

  try {
    // Check database connection
    const db = getDb();
    await db.execute('SELECT 1');
    health.checks.database = 'healthy';
  } catch (error) {
    health.status = 'unhealthy';
    health.checks.database = 'unhealthy';
    console.error('Database health check failed:', error);
  }

  // Check memory usage
  const memoryUsage = process.memoryUsage();
  const memoryUsageMB = {
    rss: Math.round(memoryUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
    external: Math.round(memoryUsage.external / 1024 / 1024),
  };

  // Consider unhealthy if heap usage is above 90%
  const heapUsagePercent = (memoryUsageMB.heapUsed / memoryUsageMB.heapTotal) * 100;
  if (heapUsagePercent > 90) {
    health.status = 'unhealthy';
    health.checks.memory = 'unhealthy';
  } else {
    health.checks.memory = 'healthy';
  }

  const responseTime = Date.now() - startTime;

  return NextResponse.json(
    {
      ...health,
      responseTime: `${responseTime}ms`,
      memory: memoryUsageMB,
    },
    {
      status: health.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );
}
