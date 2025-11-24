import { NextRequest, NextResponse } from 'next/server';
import { logger } from '../logger';

/**
 * Request Logging Middleware
 * 
 * Logs all API requests with timing and status information
 */
export function withLogging(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    // Create child logger with request context
    const requestLogger = logger.child({
      requestId,
      method: req.method,
      url: req.url,
      userAgent: req.headers.get('user-agent'),
    });

    requestLogger.info('Incoming request');

    try {
      const response = await handler(req);
      const duration = Date.now() - startTime;

      requestLogger.info('Request completed', {
        status: response.status,
        duration: `${duration}ms`,
      });

      // Add request ID to response headers
      response.headers.set('X-Request-ID', requestId);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      requestLogger.error(
        'Request failed',
        error instanceof Error ? error : new Error('Unknown error'),
        {
          duration: `${duration}ms`,
        }
      );

      throw error;
    }
  };
}

/**
 * Performance Monitoring Middleware
 * 
 * Tracks slow requests and logs warnings
 */
export function withPerformanceMonitoring(
  handler: (req: NextRequest) => Promise<NextResponse>,
  slowThresholdMs: number = 1000
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();

    const response = await handler(req);
    const duration = Date.now() - startTime;

    if (duration > slowThresholdMs) {
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
        threshold: `${slowThresholdMs}ms`,
      });
    }

    return response;
  };
}
