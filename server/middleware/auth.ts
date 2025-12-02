/**
 * Middleware de Autenticação e Autorização (RBAC)
 * FASE 1 - Sessão 1.2
 */

import { TRPCError } from '@trpc/server';
import { publicProcedure } from '../routers/index';
import { Permission, Role } from '@shared/types/permissions';
import { hasPermission, hasAnyPermission } from '../helpers/permissions';
import { db } from '../db';
import { users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * Procedure protegido que requer autenticação
 * Busca o usuário no banco e adiciona o role ao contexto
 */
export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Você precisa estar autenticado para acessar este recurso'
    });
  }

  // Buscar usuário com role
  const user = await db.query.users.findFirst({
    where: eq(users.id, ctx.userId)
  });

  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Usuário não encontrado'
    });
  }

  // Validar role
  const validRoles: Role[] = [Role.ADMIN, Role.MANAGER, Role.ANALYST, Role.VIEWER];
  const userRole = user.role as Role;
  
  if (!validRoles.includes(userRole)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Papel de usuário inválido'
    });
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
      userRole: userRole,
      userName: user.name || undefined,
      userEmail: user.email || undefined
    }
  });
});

/**
 * Procedure que requer permissão específica
 * 
 * @param permission - Permissão necessária
 * @returns Procedure com verificação de permissão
 * 
 * @example
 * export const projetosRouter = router({
 *   create: requirePermission(Permission.PROJETO_CREATE)
 *     .input(z.object({ nome: z.string() }))
 *     .mutation(async ({ input, ctx }) => {
 *       // Criar projeto
 *     })
 * });
 */
export function requirePermission(permission: Permission) {
  return protectedProcedure.use(async ({ ctx, next }) => {
    if (!hasPermission(ctx.userRole, permission)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Você não tem permissão para: ${permission}`
      });
    }

    return next({ ctx });
  });
}

/**
 * Procedure que requer qualquer uma das permissões fornecidas
 * 
 * @param permissions - Array de permissões (OR lógico)
 * @returns Procedure com verificação de permissões
 * 
 * @example
 * export const entidadesRouter = router({
 *   export: requireAnyPermission(
 *     Permission.ENTIDADE_EXPORT,
 *     Permission.ANALISE_EXPORT
 *   )
 *     .input(z.object({ ids: z.array(z.number()) }))
 *     .mutation(async ({ input, ctx }) => {
 *       // Exportar entidades
 *     })
 * });
 */
export function requireAnyPermission(...permissions: Permission[]) {
  return protectedProcedure.use(async ({ ctx, next }) => {
    if (!hasAnyPermission(ctx.userRole, permissions)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Você não tem permissão para esta ação'
      });
    }

    return next({ ctx });
  });
}

/**
 * Procedure que requer papel de administrador
 * Atalho para permissões administrativas
 */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.userRole !== Role.ADMIN) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Esta ação requer privilégios de administrador'
    });
  }

  return next({ ctx });
});

/**
 * RETROCOMPATIBILIDADE
 * Mantém a função antiga para não quebrar código existente
 * @deprecated Use requirePermission() ao invés
 */
export function requirePermissionOld(recurso: string, acao: 'read' | 'write' | 'delete') {
  // Mapear para novas permissões
  const permissionMap: Record<string, Record<string, Permission>> = {
    'projeto': {
      'read': Permission.PROJETO_READ,
      'write': Permission.PROJETO_UPDATE,
      'delete': Permission.PROJETO_DELETE
    },
    'pesquisa': {
      'read': Permission.PESQUISA_READ,
      'write': Permission.PESQUISA_UPDATE,
      'delete': Permission.PESQUISA_DELETE
    },
    'entidade': {
      'read': Permission.ENTIDADE_READ,
      'write': Permission.ENTIDADE_UPDATE,
      'delete': Permission.ENTIDADE_DELETE
    }
  };

  const permission = permissionMap[recurso]?.[acao];
  
  if (!permission) {
    // Se não encontrar mapeamento, permite (retrocompatibilidade)
    return protectedProcedure;
  }

  return requirePermission(permission);
}
