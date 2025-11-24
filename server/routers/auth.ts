/**
 * Auth Router - Autenticação com Supabase
 * Adaptado para Next.js App Router mantendo lógica de negócio original
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '@/lib/trpc/server';
import { db } from '@/lib/db';
import { users, loginAttempts, userInvites } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { createServerSupabaseClient } from '@/lib/auth/supabase';

/**
 * Router de autenticação
 */
export const authRouter = createTRPCRouter({
  /**
   * Obter usuário atual
   */
  me: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Não autenticado',
      });
    }

    // Buscar dados completos do usuário no banco
    const [userData] = await db
      .select()
      .from(users)
      .where(eq(users.email, ctx.user.email!))
      .limit(1);

    if (!userData) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Usuário não encontrado',
      });
    }

    return {
      id: userData.id,
      email: userData.email,
      nome: userData.nome,
      empresa: userData.empresa,
      cargo: userData.cargo,
      setor: userData.setor,
      role: userData.role,
      ativo: userData.ativo,
      createdAt: userData.createdAt,
      lastSignedIn: userData.lastSignedIn,
    };
  }),

  /**
   * Registrar tentativa de login (para auditoria)
   * Chamado após login bem-sucedido ou falho
   */
  logLoginAttempt: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        success: z.boolean(),
        ip: z.string().optional(),
        userAgent: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await db.insert(loginAttempts).values({
        email: input.email,
        sucesso: input.success ? 1 : 0,
        ip: input.ip || 'unknown',
        userAgent: input.userAgent || 'unknown',
      });

      return { success: true };
    }),

  /**
   * Atualizar último login do usuário
   */
  updateLastLogin: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user?.email) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Não autenticado',
      });
    }

    await db
      .update(users)
      .set({ lastSignedIn: new Date().toISOString() })
      .where(eq(users.email, ctx.user.email));

    return { success: true };
  }),

  /**
   * Verificar se email já está cadastrado
   */
  checkEmail: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .query(async ({ input }) => {
      const [user] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      return {
        exists: !!user,
      };
    }),

  /**
   * Validar token de convite
   */
  validateInvite: publicProcedure
    .input(
      z.object({
        token: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      const [invite] = await db
        .select()
        .from(userInvites)
        .where(
          and(
            eq(userInvites.token, input.token),
            eq(userInvites.usado, 0)
          )
        )
        .limit(1);

      if (!invite) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Token de convite inválido ou já utilizado',
        });
      }

      // Verificar se expirou (30 dias)
      const createdAt = new Date(invite.createdAt!);
      const now = new Date();
      const diffDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays > 30) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Token de convite expirado',
        });
      }

      return {
        valid: true,
        email: invite.email,
        role: invite.role,
      };
    }),

  /**
   * Completar registro usando convite
   * Cria usuário no Supabase e no banco local
   */
  completeRegistration: publicProcedure
    .input(
      z.object({
        token: z.string().min(1),
        nome: z.string().min(1),
        empresa: z.string().min(1),
        cargo: z.string().min(1),
        setor: z.string().min(1),
        password: z.string().min(8),
      })
    )
    .mutation(async ({ input }) => {
      // Validar convite
      const [invite] = await db
        .select()
        .from(userInvites)
        .where(
          and(
            eq(userInvites.token, input.token),
            eq(userInvites.usado, 0)
          )
        )
        .limit(1);

      if (!invite) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Token de convite inválido',
        });
      }

      // Criar usuário no Supabase
      const supabase = await createServerSupabaseClient();
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invite.email!,
        password: input.password,
        options: {
          data: {
            nome: input.nome,
            empresa: input.empresa,
            cargo: input.cargo,
            setor: input.setor,
          },
        },
      });

      if (authError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Erro ao criar usuário: ${authError.message}`,
        });
      }

      // Criar/atualizar usuário no banco local
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, invite.email!))
        .limit(1);

      if (existingUser) {
        // Atualizar usuário existente
        await db
          .update(users)
          .set({
            nome: input.nome,
            empresa: input.empresa,
            cargo: input.cargo,
            setor: input.setor,
            ativo: 1,
            lastSignedIn: new Date().toISOString(),
          })
          .where(eq(users.id, existingUser.id));
      } else {
        // Criar novo usuário
        await db.insert(users).values({
          email: invite.email,
          nome: input.nome,
          empresa: input.empresa,
          cargo: input.cargo,
          setor: input.setor,
          role: invite.role || 'visualizador',
          ativo: 1,
          createdAt: new Date().toISOString(),
          lastSignedIn: new Date().toISOString(),
        });
      }

      // Marcar convite como usado
      await db
        .update(userInvites)
        .set({ usado: 1 })
        .where(eq(userInvites.id, invite.id));

      return {
        success: true,
        user: authData.user,
      };
    }),

  /**
   * Criar convite para novo usuário (apenas admin)
   */
  createInvite: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        role: z.enum(['admin', 'visualizador']).default('visualizador'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verificar se usuário é admin
      const [currentUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, ctx.user.email!))
        .limit(1);

      if (!currentUser || currentUser.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Apenas administradores podem criar convites',
        });
      }

      // Verificar se já existe convite ativo
      const [existingInvite] = await db
        .select()
        .from(userInvites)
        .where(
          and(
            eq(userInvites.email, input.email),
            eq(userInvites.usado, 0)
          )
        )
        .limit(1);

      if (existingInvite) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Já existe um convite ativo para este email',
        });
      }

      // Gerar token único
      const token = Math.random().toString(36).substring(2) + Date.now().toString(36);

      // Criar convite
      await db.insert(userInvites).values({
        email: input.email,
        token,
        role: input.role,
        createdBy: currentUser.id,
        usado: 0,
        createdAt: new Date().toISOString(),
      });

      return {
        success: true,
        token,
        inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/register?token=${token}`,
      };
    }),
});
