/**
 * Middleware tRPC para coleta automática de métricas
 *
 * Captura tempo de execução, sucesso/falha e metadados de todas as queries e mutations
 */

import { recordMetric } from '@/server/utils/performanceMetrics';
import type { ProcedureType } from '@trpc/server';

export function createMetricsMiddleware() {
  return async function metricsMiddleware(opts: {
    path: string;
    type: ProcedureType;
    next: () => Promise<unknown>;
    input?: unknown;
  }) {
    const startTime = Date.now();
    const metricName = opts.path;
    const metricType = opts.type === 'query' ? 'query' : 'api';

    let success = true;
    let errorMessage: string | undefined;
    let result: unknown;

    try {
      result = await opts.next();
      return result;
    } catch (error) {
      success = false;
      errorMessage = error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      const executionTimeMs = Date.now() - startTime;

      // Extrair contagem de registros do resultado
      let recordCount: number | undefined;
      if (Array.isArray(result)) {
        recordCount = result.length;
      } else if (result && typeof result === 'object' && 'length' in result) {
        recordCount = (result as { length: number }).length;
      }

      // Registrar métrica de forma assíncrona (não bloqueia)
      recordMetric({
        metricName,
        metricType,
        executionTimeMs,
        recordCount,
        success,
        errorMessage,
        metadata: {
          type: opts.type,
          input: opts.input,
        },
      }).catch((err) => {
        // Silenciosamente ignorar erros de métrica
        console.error('[MetricsMiddleware] Failed to record metric:', err);
      });
    }
  };
}
