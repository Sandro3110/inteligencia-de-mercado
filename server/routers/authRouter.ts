import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import {
  validatePasswordStrength,
  hashPassword,
  comparePassword,
  generateToken,
} from '../utils/auth';

/**
 * Router para autenticação de usuários
 * Sistema de Autenticação - Fase 2
 */
export const authRouter = router({
  /**
   * Login com email e senha
   * POST /api/auth/login
   */
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email('Email inválido'),
        password: z.string().min(1, 'Senha é obrigatória'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import('../db');
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { users, loginAttempts } = await import('../../drizzle/schema');
      const { eq } = await import('drizzle-orm');

      // Buscar usuário por email
      const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);

      // Registrar tentativa de login
      const clientIp = ctx.req?.headers['x-forwarded-for'] || ctx.req?.ip || 'unknown';
      const userAgent = ctx.req?.headers['user-agent'] || 'unknown';

      if (!user) {
        // Usuário não encontrado
        await db.insert(loginAttempts).values({
          email: input.email,
          sucesso: 0,
          ip: Array.isArray(clientIp) ? clientIp[0] : clientIp,
          userAgent: userAgent,
        });

        throw new Error('Email ou senha incorretos');
      }

      // Verificar se usuário tem senha cadastrada
      if (!user.senhaHash) {
        await db.insert(loginAttempts).values({
          email: input.email,
          sucesso: 0,
          ip: Array.isArray(clientIp) ? clientIp[0] : clientIp,
          userAgent: userAgent,
        });

        throw new Error('Usuário não possui senha cadastrada. Use o sistema de convites.');
      }

      // Verificar senha
      const passwordMatch = await comparePassword(input.password, user.senhaHash);

      if (!passwordMatch) {
        // Senha incorreta
        await db.insert(loginAttempts).values({
          email: input.email,
          sucesso: 0,
          ip: Array.isArray(clientIp) ? clientIp[0] : clientIp,
          userAgent: userAgent,
        });

        throw new Error('Email ou senha incorretos');
      }

      // Verificar se usuário está ativo
      if (user.ativo !== 1) {
        await db.insert(loginAttempts).values({
          email: input.email,
          sucesso: 0,
          ip: Array.isArray(clientIp) ? clientIp[0] : clientIp,
          userAgent: userAgent,
        });

        throw new Error('Usuário aguardando aprovação do administrador');
      }

      // Login bem-sucedido
      await db.insert(loginAttempts).values({
        email: input.email,
        sucesso: 1,
        ip: Array.isArray(clientIp) ? clientIp[0] : clientIp,
        userAgent: userAgent,
      });

      // Atualizar último login
      await db
        .update(users)
        .set({ lastSignedIn: new Date().toISOString() })
        .where(eq(users.id, user.id));

      // Gerar token JWT
      const token = generateToken({
        userId: user.id,
        email: user.email!,
        role: user.role as 'admin' | 'visualizador',
        nome: user.nome || 'Usuário',
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          nome: user.nome,
          empresa: user.empresa,
          cargo: user.cargo,
          setor: user.setor,
          role: user.role,
        },
      };
    }),

  /**
   * Registrar novo usuário usando convite
   * POST /api/auth/register
   */
  register: publicProcedure
    .input(
      z.object({
        token: z.string().min(1, 'Token de convite é obrigatório'),
        nome: z.string().min(1, 'Nome é obrigatório'),
        empresa: z.string().min(1, 'Empresa é obrigatória'),
        cargo: z.string().min(1, 'Cargo é obrigatório'),
        setor: z.string().min(1, 'Setor é obrigatório'),
        password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
      })
    )
    .mutation(async ({ input }) => {
      const { getDb } = await import('../db');
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { users, userInvites } = await import('../../drizzle/schema');
      const { eq, and } = await import('drizzle-orm');

      // Validar força da senha
      const passwordValidation = validatePasswordStrength(input.password);
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.errors.join(', '));
      }

      // Buscar convite pelo token
      const [invite] = await db
        .select()
        .from(userInvites)
        .where(
          and(
            eq(userInvites.token, input.token),
            eq(userInvites.usado, 0),
            eq(userInvites.cancelado, 0)
          )
        )
        .limit(1);

      if (!invite) {
        throw new Error('Convite inválido ou já utilizado');
      }

      // Verificar se convite expirou
      const now = new Date();
      const expiresAt = new Date(invite.expiraEm);
      if (now > expiresAt) {
        throw new Error('Convite expirado');
      }

      // Verificar se email já está cadastrado
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, invite.email))
        .limit(1);

      if (existingUser && existingUser.senhaHash) {
        throw new Error('Email já cadastrado');
      }

      // Gerar hash da senha
      const senhaHash = await hashPassword(input.password);

      // Criar ou atualizar usuário
      const userId =
        existingUser?.id || `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      if (existingUser) {
        // Atualizar usuário existente
        await db
          .update(users)
          .set({
            nome: input.nome,
            empresa: input.empresa,
            cargo: input.cargo,
            setor: input.setor,
            senhaHash,
            role: invite.perfil,
            ativo: 0, // Aguardando aprovação
          })
          .where(eq(users.id, userId));
      } else {
        // Criar novo usuário
        await db.insert(users).values({
          id: userId,
          email: invite.email,
          nome: input.nome,
          empresa: input.empresa,
          cargo: input.cargo,
          setor: input.setor,
          senhaHash,
          role: invite.perfil,
          ativo: 0, // Aguardando aprovação
        });
      }

      // Marcar convite como usado
      await db
        .update(userInvites)
        .set({
          usado: 1,
          usadoEm: new Date().toISOString(),
        })
        .where(eq(userInvites.id, invite.id));

      return {
        success: true,
        message: 'Cadastro realizado com sucesso! Aguarde a aprovação do administrador.',
      };
    }),

  /**
   * Obter dados do usuário autenticado
   * GET /api/auth/me
   */
  me: publicProcedure.query(async ({ ctx }) => {
    const { getDb } = await import('../db');
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const { users } = await import('../../drizzle/schema');
    const { eq } = await import('drizzle-orm');

    const [user] = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      nome: user.nome,
      empresa: user.empresa,
      cargo: user.cargo,
      setor: user.setor,
      role: user.role,
      ativo: user.ativo,
      createdAt: user.createdAt,
      lastSignedIn: user.lastSignedIn,
    };
  }),

  /**
   * Logout (invalidar sessão no cliente)
   * POST /api/auth/logout
   */
  logout: publicProcedure.mutation(async () => {
    // No sistema JWT stateless, o logout é feito no cliente
    // removendo o token do localStorage/cookies
    return {
      success: true,
      message: 'Logout realizado com sucesso',
    };
  }),
});
