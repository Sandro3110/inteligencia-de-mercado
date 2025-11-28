import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { requireAdmin } from '../utils/auth';
import { randomBytes } from 'crypto';

/**
 * Router para gestão de usuários (admin only)
 * Sistema de Autenticação - Fase 3
 */
export const usersRouter = router({
  /**
   * Listar todos os usuários
   * GET /api/users/list
   */
  list: protectedProcedure
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
      // Verificar se é admin
      const authHeader = ctx.req?.headers.authorization;
      const { verifyToken } = await import('../utils/auth');
      const token = authHeader?.substring(7);
      if (!token) throw new Error('Não autenticado');

      const payload = verifyToken(token);
      if (!payload) throw new Error('Token inválido');

      requireAdmin(payload);

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
  invite: protectedProcedure
    .input(
      z.object({
        email: z.string().email('Email inválido'),
        perfil: z.enum(['admin', 'visualizador']),
        expiresInDays: z.number().min(1).max(30).optional().default(7),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verificar se é admin
      const authHeader = ctx.req?.headers.authorization;
      const { verifyToken } = await import('../utils/auth');
      const token = authHeader?.substring(7);
      if (!token) throw new Error('Não autenticado');

      const payload = verifyToken(token);
      if (!payload) throw new Error('Token inválido');

      requireAdmin(payload);

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
  approve: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1, 'ID do usuário é obrigatório'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verificar se é admin
      const authHeader = ctx.req?.headers.authorization;
      const { verifyToken } = await import('../utils/auth');
      const token = authHeader?.substring(7);
      if (!token) throw new Error('Não autenticado');

      const payload = verifyToken(token);
      if (!payload) throw new Error('Token inválido');

      requireAdmin(payload);

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
  deactivate: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1, 'ID do usuário é obrigatório'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verificar se é admin
      const authHeader = ctx.req?.headers.authorization;
      const { verifyToken } = await import('../utils/auth');
      const token = authHeader?.substring(7);
      if (!token) throw new Error('Não autenticado');

      const payload = verifyToken(token);
      if (!payload) throw new Error('Token inválido');

      requireAdmin(payload);

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
  changeRole: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1, 'ID do usuário é obrigatório'),
        role: z.enum(['admin', 'visualizador']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verificar se é admin
      const authHeader = ctx.req?.headers.authorization;
      const { verifyToken } = await import('../utils/auth');
      const token = authHeader?.substring(7);
      if (!token) throw new Error('Não autenticado');

      const payload = verifyToken(token);
      if (!payload) throw new Error('Token inválido');

      requireAdmin(payload);

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
  listInvites: protectedProcedure.query(async ({ ctx }) => {
    // Verificar se é admin
    const authHeader = ctx.req?.headers.authorization;
    const { verifyToken } = await import('../utils/auth');
    const token = authHeader?.substring(7);
    if (!token) throw new Error('Não autenticado');

    const payload = verifyToken(token);
    if (!payload) throw new Error('Token inválido');

    requireAdmin(payload);

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
  cancelInvite: protectedProcedure
    .input(
      z.object({
        inviteId: z.string().min(1, 'ID do convite é obrigatório'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verificar se é admin
      const authHeader = ctx.req?.headers.authorization;
      const { verifyToken } = await import('../utils/auth');
      const token = authHeader?.substring(7);
      if (!token) throw new Error('Não autenticado');

      const payload = verifyToken(token);
      if (!payload) throw new Error('Token inválido');

      requireAdmin(payload);

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
  updateRole: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1, 'ID do usuário é obrigatório'),
        role: z.string().min(1, 'Role é obrigatória'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verificar se é admin
      const authHeader = ctx.req?.headers.authorization;
      const { verifyToken } = await import('../utils/auth');
      const token = authHeader?.substring(7);
      if (!token) throw new Error('Não autenticado');

      const payload = verifyToken(token);
      if (!payload) throw new Error('Token inválido');

      requireAdmin(payload);

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
  toggleStatus: protectedProcedure
    .input(
      z.object({
        userId: z.string().min(1, 'ID do usuário é obrigatório'),
        active: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verificar se é admin
      const authHeader = ctx.req?.headers.authorization;
      const { verifyToken } = await import('../utils/auth');
      const token = authHeader?.substring(7);
      if (!token) throw new Error('Não autenticado');

      const payload = verifyToken(token);
      if (!payload) throw new Error('Token inválido');

      requireAdmin(payload);

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
});
