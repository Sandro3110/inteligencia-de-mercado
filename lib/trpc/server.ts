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

  console.log(`[tRPC] ${type} ${path} - ${durationMs}ms`);

  return result;
});

/**
 * Procedure com logging
 */
export const loggedProcedure = t.procedure.use(loggerMiddleware);
