/**
 * Sentry Alert Configuration
 * 
 * Define alert rules and thresholds for monitoring
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Alert severity levels
 */
export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Alert thresholds
 */
export const ALERT_THRESHOLDS = {
  // Performance thresholds
  SLOW_API_RESPONSE: 2000, // ms
  VERY_SLOW_API_RESPONSE: 5000, // ms
  
  // Memory thresholds
  HIGH_MEMORY_USAGE: 0.8, // 80%
  CRITICAL_MEMORY_USAGE: 0.9, // 90%
  
  // Error rate thresholds
  HIGH_ERROR_RATE: 0.05, // 5%
  CRITICAL_ERROR_RATE: 0.1, // 10%
  
  // Database thresholds
  SLOW_QUERY: 1000, // ms
  VERY_SLOW_QUERY: 3000, // ms
} as const;

/**
 * Send custom alert to Sentry
 */
export function sendAlert(
  message: string,
  severity: AlertSeverity,
  context?: Record<string, unknown>
) {
  const level = severity === AlertSeverity.CRITICAL || severity === AlertSeverity.ERROR
    ? 'error'
    : severity === AlertSeverity.WARNING
    ? 'warning'
    : 'info';

  Sentry.captureMessage(message, {
    level,
    tags: {
      alert: 'true',
      severity,
    },
    contexts: {
      alert: context,
    },
  });
}

/**
 * Check and alert on slow API response
 */
export function checkApiPerformance(
  endpoint: string,
  duration: number,
  context?: Record<string, unknown>
) {
  if (duration > ALERT_THRESHOLDS.VERY_SLOW_API_RESPONSE) {
    sendAlert(
      `Very slow API response: ${endpoint}`,
      AlertSeverity.ERROR,
      {
        endpoint,
        duration,
        threshold: ALERT_THRESHOLDS.VERY_SLOW_API_RESPONSE,
        ...context,
      }
    );
  } else if (duration > ALERT_THRESHOLDS.SLOW_API_RESPONSE) {
    sendAlert(
      `Slow API response: ${endpoint}`,
      AlertSeverity.WARNING,
      {
        endpoint,
        duration,
        threshold: ALERT_THRESHOLDS.SLOW_API_RESPONSE,
        ...context,
      }
    );
  }
}

/**
 * Check and alert on high memory usage
 */
export function checkMemoryUsage(usage: number, context?: Record<string, unknown>) {
  if (usage > ALERT_THRESHOLDS.CRITICAL_MEMORY_USAGE) {
    sendAlert(
      'Critical memory usage detected',
      AlertSeverity.CRITICAL,
      {
        usage: `${(usage * 100).toFixed(2)}%`,
        threshold: `${(ALERT_THRESHOLDS.CRITICAL_MEMORY_USAGE * 100).toFixed(2)}%`,
        ...context,
      }
    );
  } else if (usage > ALERT_THRESHOLDS.HIGH_MEMORY_USAGE) {
    sendAlert(
      'High memory usage detected',
      AlertSeverity.WARNING,
      {
        usage: `${(usage * 100).toFixed(2)}%`,
        threshold: `${(ALERT_THRESHOLDS.HIGH_MEMORY_USAGE * 100).toFixed(2)}%`,
        ...context,
      }
    );
  }
}

/**
 * Check and alert on slow database query
 */
export function checkQueryPerformance(
  query: string,
  duration: number,
  context?: Record<string, unknown>
) {
  if (duration > ALERT_THRESHOLDS.VERY_SLOW_QUERY) {
    sendAlert(
      'Very slow database query detected',
      AlertSeverity.ERROR,
      {
        query: query.substring(0, 100), // Truncate long queries
        duration,
        threshold: ALERT_THRESHOLDS.VERY_SLOW_QUERY,
        ...context,
      }
    );
  } else if (duration > ALERT_THRESHOLDS.SLOW_QUERY) {
    sendAlert(
      'Slow database query detected',
      AlertSeverity.WARNING,
      {
        query: query.substring(0, 100),
        duration,
        threshold: ALERT_THRESHOLDS.SLOW_QUERY,
        ...context,
      }
    );
  }
}

/**
 * Alert on high error rate
 */
export function checkErrorRate(
  errorRate: number,
  timeWindow: string,
  context?: Record<string, unknown>
) {
  if (errorRate > ALERT_THRESHOLDS.CRITICAL_ERROR_RATE) {
    sendAlert(
      'Critical error rate detected',
      AlertSeverity.CRITICAL,
      {
        errorRate: `${(errorRate * 100).toFixed(2)}%`,
        threshold: `${(ALERT_THRESHOLDS.CRITICAL_ERROR_RATE * 100).toFixed(2)}%`,
        timeWindow,
        ...context,
      }
    );
  } else if (errorRate > ALERT_THRESHOLDS.HIGH_ERROR_RATE) {
    sendAlert(
      'High error rate detected',
      AlertSeverity.WARNING,
      {
        errorRate: `${(errorRate * 100).toFixed(2)}%`,
        threshold: `${(ALERT_THRESHOLDS.HIGH_ERROR_RATE * 100).toFixed(2)}%`,
        timeWindow,
        ...context,
      }
    );
  }
}

/**
 * Alert on database connection failure
 */
export function alertDatabaseFailure(error: Error, context?: Record<string, unknown>) {
  sendAlert(
    'Database connection failure',
    AlertSeverity.CRITICAL,
    {
      error: error.message,
      stack: error.stack,
      ...context,
    }
  );
}

/**
 * Alert on authentication failure spike
 */
export function alertAuthFailureSpike(
  failureCount: number,
  threshold: number,
  context?: Record<string, unknown>
) {
  sendAlert(
    'Authentication failure spike detected',
    AlertSeverity.WARNING,
    {
      failureCount,
      threshold,
      ...context,
    }
  );
}

/**
 * Alert on API rate limit exceeded
 */
export function alertRateLimitExceeded(
  endpoint: string,
  ip: string,
  context?: Record<string, unknown>
) {
  sendAlert(
    'API rate limit exceeded',
    AlertSeverity.WARNING,
    {
      endpoint,
      ip,
      ...context,
    }
  );
}
