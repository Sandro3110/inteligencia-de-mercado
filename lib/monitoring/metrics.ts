/**
 * Custom Metrics System
 * 
 * Track business and technical metrics
 */

import * as Sentry from '@sentry/nextjs';
import { logger } from '../logger';

/**
 * Metric types
 */
export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  TIMER = 'timer',
}

/**
 * Metric categories
 */
export enum MetricCategory {
  BUSINESS = 'business',
  PERFORMANCE = 'performance',
  SYSTEM = 'system',
  USER = 'user',
}

interface MetricData {
  name: string;
  value: number;
  type: MetricType;
  category: MetricCategory;
  tags?: Record<string, string>;
  timestamp?: number;
}

/**
 * In-memory metrics store (for development)
 * In production, this should be sent to a metrics service
 */
const metricsStore: MetricData[] = [];
const MAX_METRICS_STORE = 1000;

/**
 * Record a metric
 */
export function recordMetric(metric: MetricData) {
  const enrichedMetric = {
    ...metric,
    timestamp: metric.timestamp || Date.now(),
  };

  // Store metric
  metricsStore.push(enrichedMetric);
  
  // Keep store size manageable
  if (metricsStore.length > MAX_METRICS_STORE) {
    metricsStore.shift();
  }

  // Log metric
  logger.debug('Metric recorded', {
    metric: enrichedMetric,
  });

  // Send to Sentry as breadcrumb
  Sentry.addBreadcrumb({
    category: metric.category,
    message: `${metric.name}: ${metric.value}`,
    level: 'info',
    data: {
      type: metric.type,
      ...metric.tags,
    },
  });
}

/**
 * Increment a counter metric
 */
export function incrementCounter(
  name: string,
  category: MetricCategory,
  increment: number = 1,
  tags?: Record<string, string>
) {
  recordMetric({
    name,
    value: increment,
    type: MetricType.COUNTER,
    category,
    tags,
  });
}

/**
 * Record a gauge metric (current value)
 */
export function recordGauge(
  name: string,
  value: number,
  category: MetricCategory,
  tags?: Record<string, string>
) {
  recordMetric({
    name,
    value,
    type: MetricType.GAUGE,
    category,
    tags,
  });
}

/**
 * Record a histogram value
 */
export function recordHistogram(
  name: string,
  value: number,
  category: MetricCategory,
  tags?: Record<string, string>
) {
  recordMetric({
    name,
    value,
    type: MetricType.HISTOGRAM,
    category,
    tags,
  });
}

/**
 * Time a function execution
 */
export async function timeFunction<T>(
  name: string,
  category: MetricCategory,
  fn: () => Promise<T>,
  tags?: Record<string, string>
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    
    recordMetric({
      name,
      value: duration,
      type: MetricType.TIMER,
      category,
      tags: {
        ...tags,
        status: 'success',
      },
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    recordMetric({
      name,
      value: duration,
      type: MetricType.TIMER,
      category,
      tags: {
        ...tags,
        status: 'error',
      },
    });
    
    throw error;
  }
}

/**
 * Get metrics summary
 */
export function getMetricsSummary(): {
  total: number;
  byCategory: Record<string, number>;
  byType: Record<string, number>;
  recent: MetricData[];
} {
  const byCategory: Record<string, number> = {};
  const byType: Record<string, number> = {};
  
  metricsStore.forEach((metric) => {
    byCategory[metric.category] = (byCategory[metric.category] || 0) + 1;
    byType[metric.type] = (byType[metric.type] || 0) + 1;
  });
  
  return {
    total: metricsStore.length,
    byCategory,
    byType,
    recent: metricsStore.slice(-10),
  };
}

/**
 * Clear metrics store
 */
export function clearMetrics() {
  metricsStore.length = 0;
}

// ============================================================================
// BUSINESS METRICS
// ============================================================================

export const BusinessMetrics = {
  /**
   * Track user registration
   */
  userRegistered: (userId: string) => {
    incrementCounter('user.registered', MetricCategory.BUSINESS, 1, { userId });
  },

  /**
   * Track user login
   */
  userLoggedIn: (userId: string) => {
    incrementCounter('user.logged_in', MetricCategory.BUSINESS, 1, { userId });
  },

  /**
   * Track project creation
   */
  projectCreated: (projectId: string, userId: string) => {
    incrementCounter('project.created', MetricCategory.BUSINESS, 1, {
      projectId,
      userId,
    });
  },

  /**
   * Track research completion
   */
  researchCompleted: (researchId: string, duration: number) => {
    recordHistogram('research.completed', duration, MetricCategory.BUSINESS, {
      researchId,
    });
  },

  /**
   * Track export
   */
  dataExported: (format: string, recordCount: number) => {
    incrementCounter('data.exported', MetricCategory.BUSINESS, 1, {
      format,
      recordCount: String(recordCount),
    });
  },
};

// ============================================================================
// PERFORMANCE METRICS
// ============================================================================

export const PerformanceMetrics = {
  /**
   * Track API response time
   */
  apiResponseTime: (endpoint: string, duration: number, status: number) => {
    recordHistogram('api.response_time', duration, MetricCategory.PERFORMANCE, {
      endpoint,
      status: String(status),
    });
  },

  /**
   * Track database query time
   */
  queryTime: (query: string, duration: number) => {
    recordHistogram('db.query_time', duration, MetricCategory.PERFORMANCE, {
      query: query.substring(0, 50),
    });
  },

  /**
   * Track page load time
   */
  pageLoadTime: (page: string, duration: number) => {
    recordHistogram('page.load_time', duration, MetricCategory.PERFORMANCE, {
      page,
    });
  },
};

// ============================================================================
// SYSTEM METRICS
// ============================================================================

export const SystemMetrics = {
  /**
   * Track memory usage
   */
  memoryUsage: (usage: number) => {
    recordGauge('system.memory_usage', usage, MetricCategory.SYSTEM);
  },

  /**
   * Track CPU usage
   */
  cpuUsage: (usage: number) => {
    recordGauge('system.cpu_usage', usage, MetricCategory.SYSTEM);
  },

  /**
   * Track active connections
   */
  activeConnections: (count: number) => {
    recordGauge('system.active_connections', count, MetricCategory.SYSTEM);
  },
};

// ============================================================================
// USER METRICS
// ============================================================================

export const UserMetrics = {
  /**
   * Track active users
   */
  activeUsers: (count: number) => {
    recordGauge('user.active', count, MetricCategory.USER);
  },

  /**
   * Track user action
   */
  userAction: (action: string, userId: string) => {
    incrementCounter('user.action', MetricCategory.USER, 1, {
      action,
      userId,
    });
  },

  /**
   * Track user session duration
   */
  sessionDuration: (userId: string, duration: number) => {
    recordHistogram('user.session_duration', duration, MetricCategory.USER, {
      userId,
    });
  },
};
