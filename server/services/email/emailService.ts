import { Resend } from "resend";
import {
  getInviteEmailTemplate,
  getApprovalEmailTemplate,
  getRejectionEmailTemplate,
  getWelcomeEmailTemplate,
} from "./templates";

/**
 * Configuração do Resend
 */
let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

/**
 * Configuração padrão de email
 */
const DEFAULT_FROM_EMAIL = process.env.EMAIL_FROM || "Intelmarket <noreply@intelmarket.app>";
const APP_URL = process.env.APP_URL || "http://localhost:3000";

/**
 * Interface para resultado de envio
 */
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Envia email de convite para novo usuário
 */
export async function sendInviteEmail(
  recipientEmail: string,
  recipientName: string,
  inviterName: string,
  inviteToken: string,
  role: "admin" | "visualizador",
  expiresInDays: number = 7
): Promise<EmailResult> {
  const resend = getResendClient();
  
  if (!resend) {
    console.warn("[Email] Resend não configurado. Email não enviado.");
    return {
      success: false,
      error: "Resend API key não configurada",
    };
  }

  try {
    const inviteUrl = `${APP_URL}/register?token=${inviteToken}`;
    const { subject, html } = getInviteEmailTemplate({
      recipientName,
      inviterName,
      inviteUrl,
      expiresInDays,
      role,
    });

    const result = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: recipientEmail,
      subject,
      html,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    // Log do envio
    console.log(`[Email] Convite enviado para ${recipientEmail} (${result.data?.id})`);

    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error) {
    console.error("[Email] Erro ao enviar convite:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Envia email de aprovação de cadastro
 */
export async function sendApprovalEmail(
  recipientEmail: string,
  userName: string,
  approverName: string
): Promise<EmailResult> {
  const resend = getResendClient();
  
  if (!resend) {
    console.warn("[Email] Resend não configurado. Email não enviado.");
    return {
      success: false,
      error: "Resend API key não configurada",
    };
  }

  try {
    const loginUrl = `${APP_URL}/login`;
    const { subject, html } = getApprovalEmailTemplate({
      userName,
      approverName,
      loginUrl,
    });

    const result = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: recipientEmail,
      subject,
      html,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    console.log(`[Email] Aprovação enviada para ${recipientEmail} (${result.data?.id})`);

    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error) {
    console.error("[Email] Erro ao enviar aprovação:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Envia email de rejeição de cadastro
 */
export async function sendRejectionEmail(
  recipientEmail: string,
  userName: string,
  reason?: string
): Promise<EmailResult> {
  const resend = getResendClient();
  
  if (!resend) {
    console.warn("[Email] Resend não configurado. Email não enviado.");
    return {
      success: false,
      error: "Resend API key não configurada",
    };
  }

  try {
    const { subject, html } = getRejectionEmailTemplate({
      userName,
      reason,
    });

    const result = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: recipientEmail,
      subject,
      html,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    console.log(`[Email] Rejeição enviada para ${recipientEmail} (${result.data?.id})`);

    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error) {
    console.error("[Email] Erro ao enviar rejeição:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Envia email de boas-vindas
 */
export async function sendWelcomeEmail(
  recipientEmail: string,
  userName: string
): Promise<EmailResult> {
  const resend = getResendClient();
  
  if (!resend) {
    console.warn("[Email] Resend não configurado. Email não enviado.");
    return {
      success: false,
      error: "Resend API key não configurada",
    };
  }

  try {
    const { subject, html } = getWelcomeEmailTemplate(userName);

    const result = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: recipientEmail,
      subject,
      html,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    console.log(`[Email] Boas-vindas enviado para ${recipientEmail} (${result.data?.id})`);

    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error) {
    console.error("[Email] Erro ao enviar boas-vindas:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Testa a configuração do Resend
 */
export async function testEmailConfiguration(): Promise<EmailResult> {
  const resend = getResendClient();
  
  if (!resend) {
    return {
      success: false,
      error: "Resend API key não configurada. Configure a variável RESEND_API_KEY.",
    };
  }

  try {
    // Tenta enviar um email de teste para o próprio remetente
    const testEmail = DEFAULT_FROM_EMAIL.match(/<(.+)>/)?.[1] || DEFAULT_FROM_EMAIL;
    
    const result = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: testEmail,
      subject: "Teste de Configuração - Intelmarket",
      html: `
        <h2>Teste de Configuração</h2>
        <p>Este é um email de teste para verificar a configuração do Resend.</p>
        <p>Se você recebeu este email, a configuração está funcionando corretamente!</p>
        <p><strong>Data/Hora:</strong> ${new Date().toLocaleString("pt-BR")}</p>
      `,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    console.log(`[Email] Email de teste enviado (${result.data?.id})`);

    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error) {
    console.error("[Email] Erro no teste de configuração:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Registra log de email enviado no banco de dados
 */
export async function logEmailSent(
  recipientEmail: string,
  emailType: "invite" | "approval" | "rejection" | "welcome",
  success: boolean,
  messageId?: string,
  error?: string
): Promise<void> {
  try {
    const { getDb } = await import("../../db");
    const db = await getDb();
    
    if (!db) {
      console.warn("[Email] Database não disponível para log");
      return;
    }

    // Criar tabela de logs se não existir (será criada via migration)
    // Por enquanto apenas log no console
    console.log(`[Email Log] ${emailType} para ${recipientEmail} - ${success ? "✓" : "✗"}`, {
      messageId,
      error,
    });
  } catch (err) {
    console.error("[Email] Erro ao registrar log:", err);
  }
}
