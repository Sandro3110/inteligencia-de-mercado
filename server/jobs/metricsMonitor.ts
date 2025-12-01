/**
 * Background Job - Monitor de Métricas
 *
 * Verifica métricas periodicamente e envia alertas quando:
 * - Query lenta (>5s)
 * - Taxa de erro alta (>5%)
 */

import { getDb } from '@/server/db';
import { sql } from 'drizzle-orm';
import { sendSlowQueryAlert, sendHighErrorRateAlert } from '@/server/services/email/metricsAlerts';

const SLOW_QUERY_THRESHOLD_MS = 5000; // 5 segundos
const ERROR_RATE_THRESHOLD = 5; // 5%
const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos

interface MetricSummary {
  metric_name: string;
  avg_execution_time: number;
  max_execution_time: number;
  total_executions: number;
  error_count: number;
  error_rate: number;
  avg_record_count: number;
}

interface RecentError {
  message: string;
  timestamp: string;
}

/**
 * Verifica queries lentas
 */
async function checkSlowQueries() {
  const db = await getDb();
  if (!db) {
    console.warn('[MetricsMonitor] Database not available');
    return;
  }

  try {
    // Buscar queries com tempo médio > threshold nas últimas 24h
    const result = await db.execute<MetricSummary>(sql`
      SELECT 
        metric_name,
        AVG(execution_time_ms) as avg_execution_time,
        MAX(execution_time_ms) as max_execution_time,
        COUNT(*) as total_executions,
        AVG(record_count) as avg_record_count
      FROM performance_metrics
      WHERE 
        created_at >= NOW() - INTERVAL '24 hours'
        AND success = true
      GROUP BY metric_name
      HAVING AVG(execution_time_ms) > ${SLOW_QUERY_THRESHOLD_MS}
      ORDER BY avg_execution_time DESC
      LIMIT 5
    `);

    if (result.rows && result.rows.length > 0) {
      console.log(`[MetricsMonitor] Found ${result.rows.length} slow queries`);

      for (const row of result.rows) {
        console.log(
          `[MetricsMonitor] Sending alert for slow query: ${row.metric_name} (${row.avg_execution_time}ms)`
        );

        await sendSlowQueryAlert(row.metric_name, row.max_execution_time, row.avg_record_count, {
          avgExecutionTime: row.avg_execution_time,
          totalExecutions: row.total_executions,
          checkPeriod: '24h',
        });
      }
    } else {
      console.log('[MetricsMonitor] No slow queries detected');
    }
  } catch (error) {
    console.error('[MetricsMonitor] Error checking slow queries:', error);
  }
}

/**
 * Verifica taxa de erro alta
 */
async function checkHighErrorRates() {
  const db = await getDb();
  if (!db) {
    console.warn('[MetricsMonitor] Database not available');
    return;
  }

  try {
    // Buscar métricas com taxa de erro > threshold nas últimas 24h
    const result = await db.execute<MetricSummary>(sql`
      SELECT 
        metric_name,
        COUNT(*) as total_executions,
        SUM(CASE WHEN success = false THEN 1 ELSE 0 END) as error_count,
        (SUM(CASE WHEN success = false THEN 1 ELSE 0 END)::float / COUNT(*)::float * 100) as error_rate
      FROM performance_metrics
      WHERE created_at >= NOW() - INTERVAL '24 hours'
      GROUP BY metric_name
      HAVING (SUM(CASE WHEN success = false THEN 1 ELSE 0 END)::float / COUNT(*)::float * 100) > ${ERROR_RATE_THRESHOLD}
      ORDER BY error_rate DESC
      LIMIT 5
    `);

    if (result.rows && result.rows.length > 0) {
      console.log(`[MetricsMonitor] Found ${result.rows.length} metrics with high error rate`);

      for (const row of result.rows) {
        // Buscar erros recentes
        const errorsResult = await db.execute<RecentError>(sql`
          SELECT 
            error_message as message,
            created_at::text as timestamp
          FROM performance_metrics
          WHERE 
            metric_name = ${row.metric_name}
            AND success = false
            AND created_at >= NOW() - INTERVAL '24 hours'
          ORDER BY created_at DESC
          LIMIT 10
        `);

        const recentErrors = errorsResult.rows || [];

        console.log(
          `[MetricsMonitor] Sending alert for high error rate: ${row.metric_name} (${row.error_rate}%)`
        );

        await sendHighErrorRateAlert(
          row.metric_name,
          row.error_count,
          row.total_executions,
          row.error_rate,
          recentErrors
        );
      }
    } else {
      console.log('[MetricsMonitor] No high error rates detected');
    }
  } catch (error) {
    console.error('[MetricsMonitor] Error checking high error rates:', error);
  }
}

/**
 * Executa verificação completa
 */
export async function runMetricsMonitor() {
  console.log('[MetricsMonitor] Starting metrics check...');

  try {
    await Promise.all([checkSlowQueries(), checkHighErrorRates()]);
    console.log('[MetricsMonitor] Metrics check completed');
  } catch (error) {
    console.error('[MetricsMonitor] Error during metrics check:', error);
  }
}

/**
 * Inicia monitoramento periódico
 */
export function startMetricsMonitor() {
  console.log(
    `[MetricsMonitor] Starting periodic monitoring (every ${CHECK_INTERVAL_MS / 1000 / 60} minutes)`
  );

  // Executar imediatamente na inicialização
  runMetricsMonitor();

  // Agendar execuções periódicas
  setInterval(() => {
    runMetricsMonitor();
  }, CHECK_INTERVAL_MS);
}

/**
 * Para monitoramento (útil para testes)
 */
let monitorInterval: NodeJS.Timeout | null = null;

export function startMetricsMonitorWithHandle() {
  if (monitorInterval) {
    console.warn('[MetricsMonitor] Monitor already running');
    return;
  }

  console.log(
    `[MetricsMonitor] Starting periodic monitoring (every ${CHECK_INTERVAL_MS / 1000 / 60} minutes)`
  );

  // Executar imediatamente na inicialização
  runMetricsMonitor();

  // Agendar execuções periódicas
  monitorInterval = setInterval(() => {
    runMetricsMonitor();
  }, CHECK_INTERVAL_MS);
}

export function stopMetricsMonitor() {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
    console.log('[MetricsMonitor] Monitoring stopped');
  }
}
