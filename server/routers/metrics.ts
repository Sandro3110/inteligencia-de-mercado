import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/lib/trpc/server';
import { getDb } from '@/server/db';

/**
 * Metrics Router - Consulta de métricas de performance
 */
export const metricsRouter = createTRPCRouter({
  /**
   * Buscar resumo de métricas (últimos 7 dias)
   */
  getSummary: publicProcedure
    .input(
      z
        .object({
          metricType: z.enum(['query', 'api', 'background_job']).optional(),
          limit: z.number().min(1).max(100).default(20),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const limit = input?.limit || 20;
      const metricType = input?.metricType;

      let query = `
        SELECT * FROM performance_metrics_summary
      `;

      if (metricType) {
        query += ` WHERE metric_type = '${metricType}'`;
      }

      query += ` LIMIT ${limit}`;

      const result = await db.execute({ sql: query });

      return result.rows;
    }),

  /**
   * Buscar métricas detalhadas com filtros
   */
  getDetailed: publicProcedure
    .input(
      z.object({
        metricName: z.string().optional(),
        metricType: z.enum(['query', 'api', 'background_job']).optional(),
        startDate: z.string().optional(), // ISO 8601
        endDate: z.string().optional(), // ISO 8601
        limit: z.number().min(1).max(1000).default(100),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const conditions: string[] = [];
      const args: unknown[] = [];
      let paramIndex = 1;

      if (input.metricName) {
        conditions.push(`metric_name = $${paramIndex++}`);
        args.push(input.metricName);
      }

      if (input.metricType) {
        conditions.push(`metric_type = $${paramIndex++}`);
        args.push(input.metricType);
      }

      if (input.startDate) {
        conditions.push(`created_at >= $${paramIndex++}`);
        args.push(input.startDate);
      }

      if (input.endDate) {
        conditions.push(`created_at <= $${paramIndex++}`);
        args.push(input.endDate);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const query = `
        SELECT 
          id,
          metric_name,
          metric_type,
          execution_time_ms,
          record_count,
          success,
          error_message,
          metadata,
          created_at
        FROM performance_metrics
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex}
      `;

      args.push(input.limit);

      const result = await db.execute({ sql: query, args });

      return result.rows;
    }),

  /**
   * Buscar top queries mais lentas
   */
  getSlowQueries: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).default(10),
          minTimeMs: z.number().min(0).default(1000), // Mínimo 1s
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const limit = input?.limit || 10;
      const minTimeMs = input?.minTimeMs || 1000;

      const query = `
        SELECT 
          metric_name,
          metric_type,
          execution_time_ms,
          record_count,
          metadata,
          created_at
        FROM performance_metrics
        WHERE execution_time_ms >= ${minTimeMs}
          AND created_at >= NOW() - INTERVAL '7 days'
        ORDER BY execution_time_ms DESC
        LIMIT ${limit}
      `;

      const result = await db.execute({ sql: query });

      return result.rows;
    }),

  /**
   * Buscar estatísticas por período
   */
  getStats: publicProcedure
    .input(
      z.object({
        metricName: z.string(),
        days: z.number().min(1).max(90).default(7),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const query = `
        SELECT 
          COUNT(*) AS total_executions,
          AVG(execution_time_ms)::INTEGER AS avg_time_ms,
          MIN(execution_time_ms) AS min_time_ms,
          MAX(execution_time_ms) AS max_time_ms,
          PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY execution_time_ms)::INTEGER AS median_time_ms,
          PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY execution_time_ms)::INTEGER AS p95_time_ms,
          SUM(record_count) AS total_records,
          SUM(CASE WHEN success THEN 1 ELSE 0 END) AS success_count,
          SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) AS error_count
        FROM performance_metrics
        WHERE metric_name = $1
          AND created_at >= NOW() - INTERVAL '${input.days} days'
      `;

      const result = await db.execute({ sql: query, args: [input.metricName] });

      return result.rows[0] || null;
    }),
});
