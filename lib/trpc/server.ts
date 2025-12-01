import { logger } from '@/lib/logger';

import { initTRPC, TRPCError } from '@trpc/server';
import { cache } from 'react';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { getUser } from '@/lib/auth/supabase';
import { db } from '@/lib/db';

/**
 * Contexto do tRPC
 * Contém informações sobre a requisição, usuário autenticado, etc.
 */
export const createTRPCContext = cache(async () => {
  const user = await getUser();

  return {
    db,
    user,
  };
});

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * Inicialização do tRPC
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Router e procedure builders
 */
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

/**
 * Procedure protegida (requer autenticação)
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Você precisa estar autenticado para acessar este recurso',
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

/**
 * Middleware para logging (opcional, útil para debug)
 */
const loggerMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = Date.now();
  const result = await next();
  const durationMs = Date.now() - start;

  logger.debug(`[tRPC] ${type} ${path} - ${durationMs}ms`);

  return result;
});

/**
 * Middleware para coleta automática de métricas
 */
const metricsMiddleware = t.middleware(async ({ path, type, next, input }) => {
  const startTime = Date.now();
  const metricName = path;
  const metricType = type === 'query' ? 'query' : 'api';

  let success = true;
  let errorMessage: string | undefined;
  let result: unknown;

  try {
    result = await next();
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
    import('@/server/utils/performanceMetrics')
      .then(({ recordMetric }) => {
        return recordMetric({
          metricName,
          metricType,
          executionTimeMs,
          recordCount,
          success,
          errorMessage,
          metadata: {
            type,
            hasInput: !!input,
          },
        });
      })
      .catch((err) => {
        // Silenciosamente ignorar erros de métrica
        console.error('[MetricsMiddleware] Failed to record metric:', err);
      });
  }
});

/**
 * Procedure com logging
 */
export const loggedProcedure = t.procedure.use(loggerMiddleware);
