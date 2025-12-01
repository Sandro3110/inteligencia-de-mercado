/**
 * Performance Metrics Utility
 *
 * Utilitário para coletar e armazenar métricas de performance do sistema.
 * Usado para monitoramento e análise de queries, APIs e background jobs.
 */

import { getDb } from '@/server/db';

export type MetricType = 'query' | 'api' | 'background_job';

export interface PerformanceMetric {
  metricName: string;
  metricType: MetricType;
  executionTimeMs: number;
  recordCount?: number;
  success?: boolean;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Registrar métrica de performance
 */
export async function recordMetric(metric: PerformanceMetric): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn('[Metrics] Database not available, skipping metric');
      return;
    }

    await db.execute({
      sql: `
        INSERT INTO performance_metrics (
          metric_name, 
          metric_type, 
          execution_time_ms, 
          record_count, 
          success, 
          error_message, 
          metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      args: [
        metric.metricName,
        metric.metricType,
        metric.executionTimeMs,
        metric.recordCount || 0,
        metric.success !== false, // default true
        metric.errorMessage || null,
        metric.metadata ? JSON.stringify(metric.metadata) : null,
      ],
    });
  } catch (error) {
    // Não falhar a operação principal se métrica falhar
    console.error('[Metrics] Failed to record metric:', error);
  }
}

/**
 * Wrapper para medir tempo de execução de uma função
 */
export async function measurePerformance<T>(
  metricName: string,
  metricType: MetricType,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  const startTime = Date.now();
  let success = true;
  let errorMessage: string | undefined;
  let recordCount: number | undefined;

  try {
    const result = await fn();

    // Tentar extrair contagem de registros do resultado
    if (Array.isArray(result)) {
      recordCount = result.length;
    } else if (result && typeof result === 'object' && 'length' in result) {
      recordCount = (result as { length: number }).length;
    }

    return result;
  } catch (error) {
    success = false;
    errorMessage = error instanceof Error ? error.message : String(error);
    throw error;
  } finally {
    const executionTimeMs = Date.now() - startTime;

    // Registrar métrica de forma assíncrona (não bloqueia)
    recordMetric({
      metricName,
      metricType,
      executionTimeMs,
      recordCount,
      success,
      errorMessage,
      metadata,
    }).catch(() => {
      // Silenciosamente ignorar erros de métrica
    });
  }
}

/**
 * Exemplo de uso:
 *
 * // Medir performance de uma query
 * const result = await measurePerformance(
 *   'dashboard.getProjects',
 *   'query',
 *   async () => {
 *     return await db.select().from(projects);
 *   },
 *   { projectId: 123 }
 * );
 *
 * // Registrar métrica manualmente
 * await recordMetric({
 *   metricName: 'enrichment.start',
 *   metricType: 'background_job',
 *   executionTimeMs: 5000,
 *   recordCount: 100,
 *   success: true,
 *   metadata: { pesquisaId: 456 }
 * });
 */
