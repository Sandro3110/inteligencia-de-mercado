import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { requireAdmin } from "../utils/auth";

/**
 * Router para configuração de email (admin only)
 * Sistema de Autenticação - Fase 4
 */
export const emailConfigRouter = router({
  /**
   * Testar configuração do Resend
   * POST /api/emailConfig/test
   */
  test: protectedProcedure.mutation(async ({ ctx }) => {
    // Verificar se é admin
    const authHeader = ctx.req?.headers.authorization;
    const { verifyToken } = await import("../utils/auth");
    const token = authHeader?.substring(7);
    if (!token) throw new Error("Não autenticado");

    const payload = verifyToken(token);
    if (!payload) throw new Error("Token inválido");

    requireAdmin(payload);

    // Testar configuração
    const { testEmailConfiguration } = await import("../services/email");
    const result = await testEmailConfiguration();

    return result;
  }),

  /**
   * Obter configuração atual de email
   * GET /api/emailConfig/get
   */
  get: protectedProcedure.query(async ({ ctx }) => {
    // Verificar se é admin
    const authHeader = ctx.req?.headers.authorization;
    const { verifyToken } = await import("../utils/auth");
    const token = authHeader?.substring(7);
    if (!token) throw new Error("Não autenticado");

    const payload = verifyToken(token);
    if (!payload) throw new Error("Token inválido");

    requireAdmin(payload);

    // Retornar configuração (sem expor a API key completa)
    const hasApiKey = !!process.env.RESEND_API_KEY;
    const fromEmail = process.env.EMAIL_FROM || "Intelmarket <noreply@intelmarket.app>";
    const appUrl = process.env.APP_URL || "http://localhost:3000";

    return {
      configured: hasApiKey,
      fromEmail,
      appUrl,
      apiKeyConfigured: hasApiKey,
    };
  }),

  /**
   * Enviar email de teste para um destinatário específico
   * POST /api/emailConfig/sendTest
   */
  sendTest: protectedProcedure
    .input(
      z.object({
        recipientEmail: z.string().email("Email inválido"),
        recipientName: z.string().min(1, "Nome é obrigatório"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verificar se é admin
      const authHeader = ctx.req?.headers.authorization;
      const { verifyToken } = await import("../utils/auth");
      const token = authHeader?.substring(7);
      if (!token) throw new Error("Não autenticado");

      const payload = verifyToken(token);
      if (!payload) throw new Error("Token inválido");

      requireAdmin(payload);

      // Enviar email de boas-vindas como teste
      const { sendWelcomeEmail } = await import("../services/email");
      const result = await sendWelcomeEmail(
        input.recipientEmail,
        input.recipientName
      );

      return result;
    }),

  /**
   * Reenviar email de convite
   * POST /api/emailConfig/resendInvite
   */
  resendInvite: protectedProcedure
    .input(
      z.object({
        inviteId: z.string().min(1, "ID do convite é obrigatório"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verificar se é admin
      const authHeader = ctx.req?.headers.authorization;
      const { verifyToken } = await import("../utils/auth");
      const token = authHeader?.substring(7);
      if (!token) throw new Error("Não autenticado");

      const payload = verifyToken(token);
      if (!payload) throw new Error("Token inválido");

      requireAdmin(payload);

      const { getDb } = await import("../db");
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { userInvites } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");

      // Buscar convite
      const [invite] = await db
        .select()
        .from(userInvites)
        .where(eq(userInvites.id, input.inviteId))
        .limit(1);

      if (!invite) {
        throw new Error("Convite não encontrado");
      }

      if (invite.usado === 1) {
        throw new Error("Este convite já foi utilizado");
      }

      if (invite.cancelado === 1) {
        throw new Error("Este convite foi cancelado");
      }

      // Verificar se expirou
      const now = new Date();
      const expiresAt = new Date(invite.expiraEm);
      if (now > expiresAt) {
        throw new Error("Este convite expirou. Crie um novo convite.");
      }

      // Reenviar email
      const { sendInviteEmail } = await import("../services/email");
      const expiresInDays = Math.ceil(
        (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      const result = await sendInviteEmail(
        invite.email,
        invite.email.split("@")[0],
        payload.nome,
        invite.token,
        invite.perfil as "admin" | "visualizador",
        expiresInDays
      );

      return result;
    }),
});
