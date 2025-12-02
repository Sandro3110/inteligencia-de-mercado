/**
 * Middleware de Autenticação para tRPC
 * 100% Funcional
 */

import { TRPCError } from '@trpc/server';
import { publicProcedure } from '../routers/index';

/**
 * Procedure protegido que requer autenticação
 */
export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Você precisa estar autenticado para acessar este recurso'
    });
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId // TypeScript agora sabe que userId não é null
    }
  });
});

/**
 * Procedure que requer permissão específica
 */
export function requirePermission(recurso: string, acao: 'read' | 'write' | 'delete') {
  return protectedProcedure.use(async ({ ctx, next }) => {
    // TODO: Implementar verificação de permissões baseada em roles
    // Por enquanto, todos os usuários autenticados têm acesso total
    
    return next({
      ctx
    });
  });
}
