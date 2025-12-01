import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { requireAdminProcedure } from '../../lib/trpc/server';
import { randomBytes } from 'crypto';

/**
 * Router para gestão de usuários (admin only)
 * Sistema de Autenticação - Fase 3
 */
export const usersRouter = router({
  /**
   * Obter estatísticas de usuários
   * GET /api/users/stats
   */
  getStats: requireAdminProcedure.query(async ({ ctx }) => {
    const { getDb } = await import('../db');
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const { users } = await import('../../drizzle/schema');
    const { eq, count } = await import('drizzle-orm');

    // Contar usuários por status
    const [pendingCount] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.ativo, 0));

    const [approvedCount] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.ativo, 1));

    const [rejectedCount] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.ativo, -1));

    const [totalCount] = await db.select({ count: count() }).from(users);

    return {
      pending: pendingCount.count || 0,
      approved: approvedCount.count || 0,
      rejected: rejectedCount.count || 0,
      total: totalCount.count || 0,
    };
  }),

  /**
   * Listar todos os usuários
   * GET /api/users/list
   */
  list: requireAdminProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
          role: z.enum(['admin', 'visualizador']).optional(),
          ativo: z.number().optional(),
          limit: z.number().min(1).max(100).optional().default(50),
          offset: z.number().min(0).optional().default(0),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { getDb } = await import('../db');
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { users } = await import('../../drizzle/schema');
      const { eq, like, and, or } = await import('drizzle-orm');

      // Construir filtros
      const conditions = [];

      if (input?.search) {
        conditions.push(
          or(
            like(users.nome, `%${input.search}%`),
            like(users.email, `%${input.search}%`),
            like(users.empresa, `%${input.search}%`)
          )
        );
      }

      if (input?.role) {
        conditions.push(eq(users.role, input.role));
      }

      if (input?.ativo !== undefined) {
        conditions.push(eq(users.ativo, input.ativo));
      }

      // Buscar usuários
      const results =
        conditions.length > 0
          ? await db
              .select()
              .from(users)
              .where(and(...conditions))
              .limit(input?.limit || 50)
              .offset(input?.offset || 0)
          : await db
              .select()
              .from(users)
              .limit(input?.limit || 50)
              .offset(input?.offset || 0);

      // Contar total
      const { count } = await import('drizzle-orm');
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
        limit: input?.limit || 50,
        offset: input?.offset || 0,
      };
    }),

  /**
   * Criar convite para novo usuário
   * POST /api/users/invite
   */
  invite: publicProcedure
    .input(
      z.object({
        email: z.string().email('Email inválido'),
        perfil: z.enum(['admin', 'visualizador']),
        expiresInDays: z.number().min(1).max(30).optional().default(7),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import('../db');
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { users, userInvites } = await import('../../drizzle/schema');
      const { eq } = await import('drizzle-orm');

      // Verificar se email já está cadastrado
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existingUser && existingUser.senhaHash) {
        throw new Error('Este email já está cadastrado no sistema');
      }

      // Gerar token único
      const inviteToken = randomBytes(32).toString('hex');
      const inviteId = `invite_${Date.now()}_${randomBytes(8).toString('hex')}`;

      // Calcular data de expiração
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);

      // Criar convite
      await db.insert(userInvites).values({
        id: inviteId,
        email: input.email,
        perfil: input.perfil,
        token: inviteToken,
        criadoPor: payload.userId,
        expiraEm: expiresAt.toISOString(),
      });

      // Enviar email de convite
      const { sendInviteEmail } = await import('../services/email');
      const emailResult = await sendInviteEmail(
        input.email,
        input.email.split('@')[0], // Nome temporário até o usuário se cadastrar
        payload.nome,
        inviteToken,
        input.perfil,
        input.expiresInDays
      );

      if (!emailResult.success) {
        console.warn(`[Invite] Email não enviado: ${emailResult.error}`);
      }

      return {
        success: true,
        inviteId,
        token: inviteToken,
        email: input.email,
        perfil: input.perfil,
        expiresAt: expiresAt.toISOString(),
        inviteUrl: `${process.env.APP_URL || 'http://localhost:3000'}/register?token=${inviteToken}`,
      };
    }),

  /**
   * Aprovar usuário
   * POST /api/users/approve
   */
  approve: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1, 'ID do usuário é obrigatório'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import('../db');
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { users } = await import('../../drizzle/schema');
      const { eq } = await import('drizzle-orm');

      // Buscar usuário
      const [user] = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      if (user.ativo === 1) {
        throw new Error('Usuário já está ativo');
      }

      // Aprovar usuário
      await db
        .update(users)
        .set({
          ativo: 1,
          liberadoPor: payload.userId,
          liberadoEm: new Date().toISOString(),
        })
        .where(eq(users.id, input.userId));

      // Enviar email de aprovação
      if (user.email && user.nome) {
        const { sendApprovalEmail } = await import('../services/email');
        const emailResult = await sendApprovalEmail(user.email, user.nome, payload.nome);

        if (!emailResult.success) {
          console.warn(`[Approve] Email não enviado: ${emailResult.error}`);
        }
      }

      return {
        success: true,
        message: 'Usuário aprovado com sucesso',
        userId: input.userId,
      };
    }),

  /**
   * Rejeitar/desativar usuário
   * POST /api/users/deactivate
   */
  deactivate: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1, 'ID do usuário é obrigatório'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import('../db');
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { users } = await import('../../drizzle/schema');
      const { eq } = await import('drizzle-orm');

      // Buscar usuário
      const [user] = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Não permitir desativar a si mesmo
      if (user.id === payload.userId) {
        throw new Error('Você não pode desativar sua própria conta');
      }

      // Desativar usuário
      await db
        .update(users)
        .set({
          ativo: 0,
        })
        .where(eq(users.id, input.userId));

      return {
        success: true,
        message: 'Usuário desativado com sucesso',
        userId: input.userId,
      };
    }),

  /**
   * Alterar perfil do usuário
   * POST /api/users/changeRole
   */
  changeRole: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1, 'ID do usuário é obrigatório'),
        role: z.enum(['admin', 'visualizador']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import('../db');
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { users } = await import('../../drizzle/schema');
      const { eq } = await import('drizzle-orm');

      // Buscar usuário
      const [user] = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Não permitir alterar o próprio perfil
      if (user.id === payload.userId) {
        throw new Error('Você não pode alterar seu próprio perfil');
      }

      // Alterar perfil
      await db
        .update(users)
        .set({
          role: input.role,
        })
        .where(eq(users.id, input.userId));

      return {
        success: true,
        message: `Perfil alterado para ${input.role} com sucesso`,
        userId: input.userId,
        newRole: input.role,
      };
    }),

  /**
   * Listar convites pendentes
   * GET /api/users/invites
   */
  listInvites: publicProcedure.query(async ({ ctx }) => {
    const { getDb } = await import('../db');
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const { userInvites } = await import('../../drizzle/schema');
    const { eq } = await import('drizzle-orm');

    // Buscar convites não usados e não cancelados
    const invites = await db.select().from(userInvites).where(eq(userInvites.usado, 0));

    return {
      invites: invites.map((inv) => ({
        id: inv.id,
        email: inv.email,
        perfil: inv.perfil,
        criadoPor: inv.criadoPor,
        criadoEm: inv.criadoEm,
        expiraEm: inv.expiraEm,
        usado: inv.usado,
        cancelado: inv.cancelado,
        expired: new Date(inv.expiraEm) < new Date(),
      })),
    };
  }),

  /**
   * Cancelar convite
   * POST /api/users/cancelInvite
   */
  cancelInvite: publicProcedure
    .input(
      z.object({
        inviteId: z.string().min(1, 'ID do convite é obrigatório'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import('../db');
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { userInvites } = await import('../../drizzle/schema');
      const { eq } = await import('drizzle-orm');

      // Cancelar convite
      await db
        .update(userInvites)
        .set({
          cancelado: 1,
        })
        .where(eq(userInvites.id, input.inviteId));

      return {
        success: true,
        message: 'Convite cancelado com sucesso',
      };
    }),

  /**
   * Atualizar role do usuário
   * POST /api/users/updateRole
   */
  updateRole: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1, 'ID do usuário é obrigatório'),
        role: z.string().min(1, 'Role é obrigatória'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import('../db');
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { users } = await import('../../drizzle/schema');
      const { eq } = await import('drizzle-orm');

      // Atualizar role
      await db
        .update(users)
        .set({
          role: input.role,
        })
        .where(eq(users.id, input.userId));

      return {
        success: true,
        message: 'Role atualizada com sucesso',
      };
    }),

  /**
   * Ativar/desativar usuário
   * POST /api/users/toggleStatus
   */
  toggleStatus: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1, 'ID do usuário é obrigatório'),
        active: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import('../db');
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { users } = await import('../../drizzle/schema');
      const { eq } = await import('drizzle-orm');

      // Atualizar status
      await db
        .update(users)
        .set({
          ativo: input.active ? 1 : 0,
        })
        .where(eq(users.id, input.userId));

      return {
        success: true,
        message: input.active ? 'Usuário ativado' : 'Usuário desativado',
      };
    }),

  /**
   * Aprovar usuário pendente
   * POST /api/users/approve
   */
  approve: requireAdminProcedure
    .input(
      z.object({
        userId: z.string().min(1, 'ID do usuário é obrigatório'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import('../db');
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { users } = await import('../../drizzle/schema');
      const { eq } = await import('drizzle-orm');

      // Buscar usuário
      const [user] = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      if (user.ativo !== 0) {
        throw new Error('Apenas usuários pendentes podem ser aprovados');
      }

      // Atualizar usuário
      await db
        .update(users)
        .set({
          ativo: 1,
          liberadoPor: ctx.user.id,
          liberadoEm: new Date().toISOString(),
        })
        .where(eq(users.id, input.userId));

      // Enviar email de aprovação
      try {
        const { sendUserApprovedEmail } = await import('../services/email/userNotifications');
        await sendUserApprovedEmail(user.email, user.nome);
      } catch (emailError) {
        console.error('[users.approve] Erro ao enviar email:', emailError);
        // Não falhar a aprovação se o email falhar
      }

      // Registrar log de auditoria
      try {
        const { logUserActivity } = await import('../services/userActivityLog');
        await logUserActivity({
          userId: input.userId,
          adminId: ctx.user.id,
          action: 'approved',
          details: {
            email: user.email,
            nome: user.nome,
          },
        });
      } catch (logError) {
        console.error('[users.approve] Erro ao registrar log:', logError);
      }

      return {
        success: true,
        message: 'Usuário aprovado com sucesso',
        user: {
          id: user.id,
          email: user.email,
          nome: user.nome,
          ativo: 1,
        },
      };
    }),

  /**
   * Rejeitar usuário pendente
   * POST /api/users/reject
   */
  reject: requireAdminProcedure
    .input(
      z.object({
        userId: z.string().min(1, 'ID do usuário é obrigatório'),
        motivo: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import('../db');
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { users } = await import('../../drizzle/schema');
      const { eq } = await import('drizzle-orm');

      // Buscar usuário
      const [user] = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      if (user.ativo !== 0) {
        throw new Error('Apenas usuários pendentes podem ser rejeitados');
      }

      // Atualizar usuário
      await db
        .update(users)
        .set({
          ativo: -1,
        })
        .where(eq(users.id, input.userId));

      // Enviar email de rejeição
      try {
        const { sendUserRejectedEmail } = await import('../services/email/userNotifications');
        await sendUserRejectedEmail(user.email, user.nome, input.motivo);
      } catch (emailError) {
        console.error('[users.reject] Erro ao enviar email:', emailError);
        // Não falhar a rejeição se o email falhar
      }

      // Registrar log de auditoria
      try {
        const { logUserActivity } = await import('../services/userActivityLog');
        await logUserActivity({
          userId: input.userId,
          adminId: ctx.user.id,
          action: 'rejected',
          details: {
            email: user.email,
            nome: user.nome,
            motivo: input.motivo,
          },
        });
      } catch (logError) {
        console.error('[users.reject] Erro ao registrar log:', logError);
      }

      return {
        success: true,
        message: 'Usuário rejeitado com sucesso',
      };
    }),
});
