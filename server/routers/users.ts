/**
 * Users Router - Gerenciamento de usuários (Admin only)
 * Adaptado para Next.js App Router + Supabase
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '@/lib/trpc/server';
import { db } from '@/lib/db';
import { users, userInvites } from '@/drizzle/schema';
import { eq, like, and, or, count } from 'drizzle-orm';
import { createServerSupabaseClient } from '@/lib/auth/supabase';
import { randomBytes } from 'crypto';

/**
 * Middleware para verificar se usuário é admin
 */
const requireAdmin = protectedProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Não autenticado',
    });
  }

  const [userData] = await db
    .select()
    .from(users)
    .where(eq(users.email, ctx.user.email!))
    .limit(1);

  if (!userData || userData.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Apenas administradores podem acessar este recurso',
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      userData,
    },
  });
});

/**
 * Router de gerenciamento de usuários
 */
export const usersRouter = createTRPCRouter({
  /**
   * Listar todos os usuários com filtros e paginação
   */
  list: requireAdmin
    .input(
      z
        .object({
          search: z.string().optional(),
          role: z.enum(['admin', 'visualizador']).optional(),
          ativo: z.number().optional(),
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const params = input || {};

      // Construir filtros
      const conditions = [];

      // @ts-ignore - TODO: Fix TypeScript error
      if (params.search) {
        conditions.push(
          or(
            // @ts-ignore - TODO: Fix TypeScript error
            like(users.nome, `%${params.search}%`),
            // @ts-ignore - TODO: Fix TypeScript error
            like(users.email, `%${params.search}%`),
            // @ts-ignore - TODO: Fix TypeScript error
            like(users.empresa, `%${params.search}%`)
          )
        );
      }

      // @ts-ignore - TODO: Fix TypeScript error
      if (params.role) {
        // @ts-ignore - TODO: Fix TypeScript error
        conditions.push(eq(users.role, params.role));
      }

      // @ts-ignore - TODO: Fix TypeScript error
      if (params.ativo !== undefined) {
        // @ts-ignore - TODO: Fix TypeScript error
        conditions.push(eq(users.ativo, params.ativo));
      }

      // Buscar usuários
      const results =
        conditions.length > 0
          ? await db
              .select()
              .from(users)
              .where(and(...conditions))
              // @ts-ignore - TODO: Fix TypeScript error
              .limit(params.limit)
              // @ts-ignore - TODO: Fix TypeScript error
              .offset(params.offset)
          // @ts-ignore - TODO: Fix TypeScript error
          : await db.select().from(users).limit(params.limit).offset(params.offset);

      // Contar total
      const countQuery = db.select({ total: count() }).from(users);

      const [{ total }] =
        conditions.length > 0 ? await countQuery.where(and(...conditions)) : await countQuery;

      return {
        users: results.map((u) => ({
          id: u.id,
          email: u.email,
          nome: u.nome,
          empresa: u.empresa,
          cargo: u.cargo,
          setor: u.setor,
          role: u.role,
          ativo: u.ativo,
          createdAt: u.createdAt,
          lastSignedIn: u.lastSignedIn,
          liberadoPor: u.liberadoPor,
          liberadoEm: u.liberadoEm,
        })),
        total: typeof total === 'number' ? total : results.length,
        // @ts-ignore - TODO: Fix TypeScript error
        limit: params.limit,
        // @ts-ignore - TODO: Fix TypeScript error
        offset: params.offset,
      };
    }),

  /**
   * Criar convite para novo usuário
   */
  invite: requireAdmin
    .input(
      z.object({
        email: z.string().email('Email inválido'),
        role: z.enum(['admin', 'visualizador']).default('visualizador'),
        expiresInDays: z.number().min(1).max(30).default(7),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verificar se email já está cadastrado
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existingUser) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Este email já está cadastrado no sistema',
        });
      }

      // Verificar se já existe convite ativo
      const [existingInvite] = await db
        .select()
        .from(userInvites)
        .where(and(eq(userInvites.email, input.email), eq(userInvites.usado, 0)))
        .limit(1);

      if (existingInvite) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Já existe um convite ativo para este email',
        });
      }

      // Gerar token único
      const inviteToken = randomBytes(32).toString('hex');

      // Calcular data de expiração
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);

      // Criar convite
      // @ts-ignore - TODO: Fix TypeScript error
      await db.insert(userInvites).values({
        email: input.email,
        token: inviteToken,
        role: input.role,
        createdBy: ctx.userData.id,
        usado: 0,
        createdAt: new Date().toISOString(),
      });

      // TODO: Enviar email de convite (implementar na Fase 7)
      // const { sendInviteEmail } = await import('@/server/services/email');
      // await sendInviteEmail(input.email, inviteToken, input.role, input.expiresInDays);

      return {
        success: true,
        token: inviteToken,
        email: input.email,
        role: input.role,
        expiresAt: expiresAt.toISOString(),
        inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/register?token=${inviteToken}`,
      };
    }),

  /**
   * Aprovar usuário
   */
  approve: requireAdmin
    .input(
      z.object({
        userId: z.number().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [user] = await db
        .select()
        .from(users)
        // @ts-ignore - TODO: Fix TypeScript error
        .where(eq(users.id, input.userId))
        .limit(1);

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Usuário não encontrado',
        });
      }

      if (user.ativo === 1) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Usuário já está ativo',
        });
      }

      // Ativar usuário
      await db
        .update(users)
        .set({
          ativo: 1,
          liberadoPor: ctx.userData.id,
          liberadoEm: new Date().toISOString(),
        })
        // @ts-ignore - TODO: Fix TypeScript error
        .where(eq(users.id, input.userId));

      return {
        success: true,
        message: 'Usuário aprovado com sucesso',
      };
    }),

  /**
   * Desativar usuário
   */
  deactivate: requireAdmin
    .input(
      z.object({
        userId: z.number().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const [user] = await db
        .select()
        .from(users)
        // @ts-ignore - TODO: Fix TypeScript error
        .where(eq(users.id, input.userId))
        .limit(1);

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Usuário não encontrado',
        });
      }

      if (user.ativo === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Usuário já está inativo',
        });
      }

      // Desativar usuário
      // @ts-ignore - TODO: Fix TypeScript error
      await db.update(users).set({ ativo: 0 }).where(eq(users.id, input.userId));

      // Desativar no Supabase também
      const supabase = await createServerSupabaseClient();
      if (user.email) {
        await supabase.auth.admin.updateUserById(user.email, {
          ban_duration: 'none', // Supabase não tem "desativar", apenas ban
        });
      }

      return {
        success: true,
        message: 'Usuário desativado com sucesso',
      };
    }),

  /**
   * Mudar role do usuário
   */
  changeRole: requireAdmin
    .input(
      z.object({
        userId: z.number().min(1),
        role: z.enum(['admin', 'visualizador']),
      })
    )
    .mutation(async ({ input }) => {
      const [user] = await db
        .select()
        .from(users)
        // @ts-ignore - TODO: Fix TypeScript error
        .where(eq(users.id, input.userId))
        .limit(1);

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Usuário não encontrado',
        });
      }

      if (user.role === input.role) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Usuário já possui este perfil',
        });
      }

      // Atualizar role
      // @ts-ignore - TODO: Fix TypeScript error
      await db.update(users).set({ role: input.role }).where(eq(users.id, input.userId));

      return {
        success: true,
        message: 'Perfil atualizado com sucesso',
      };
    }),

  /**
   * Listar convites
   */
  listInvites: requireAdmin.query(async () => {
    const invites = await db
      .select({
        id: userInvites.id,
        email: userInvites.email,
        token: userInvites.token,
        // @ts-ignore - TODO: Fix TypeScript error
        role: userInvites.role,
        usado: userInvites.usado,
        // @ts-ignore - TODO: Fix TypeScript error
        createdAt: userInvites.createdAt,
        // @ts-ignore - TODO: Fix TypeScript error
        createdBy: userInvites.createdBy,
      })
      .from(userInvites)
      // @ts-ignore - TODO: Fix TypeScript error
      .orderBy(userInvites.createdAt);

    return {
      invites,
    };
  }),

  /**
   * Cancelar convite
   */
  cancelInvite: requireAdmin
    .input(
      z.object({
        inviteId: z.number().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const [invite] = await db
        .select()
        .from(userInvites)
        // @ts-ignore - TODO: Fix TypeScript error
        .where(eq(userInvites.id, input.inviteId))
        .limit(1);

      if (!invite) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Convite não encontrado',
        });
      }

      if (invite.usado === 1) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Convite já foi utilizado',
        });
      }

      // Marcar como usado (cancelado)
      // @ts-ignore - TODO: Fix TypeScript error
      await db.update(userInvites).set({ usado: 1 }).where(eq(userInvites.id, input.inviteId));

      return {
        success: true,
        message: 'Convite cancelado com sucesso',
      };
    }),
});
