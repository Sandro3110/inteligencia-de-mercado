/**
 * Serviço de Notificações de Usuários
 * Envia emails via Resend para aprovação/rejeição de cadastros
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'contato@intelmarket.app';
const APP_URL = process.env.APP_URL || 'https://intelmarket.app';

/**
 * Envia email de aprovação de cadastro
 */
export async function sendUserApprovedEmail(email: string, nome: string) {
  const primeiroNome = nome.split(' ')[0];
  const subject = `Seu acesso ao Intelmarket foi liberado, ${primeiroNome}!`;

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f5f5f5;">
  
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Bem-vindo ao Intelmarket!</h1>
  </div>
  
  <!-- Body -->
  <div style="background: white; padding: 40px 30px;">
    <p style="font-size: 16px; margin: 0 0 20px 0; color: #333;">
      Olá ${primeiroNome},
    </p>
    
    <p style="font-size: 16px; margin: 0 0 25px 0; color: #333;">
      Seu cadastro foi aprovado e você já pode acessar a plataforma Intelmarket. 
      Agora você tem acesso completo a todas as ferramentas de inteligência de mercado.
    </p>
    
    <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 30px 0;">
      <h2 style="margin: 0 0 15px 0; color: #667eea; font-size: 18px; font-weight: 600;">O que você pode fazer agora:</h2>
      <ul style="margin: 0; padding: 0 0 0 20px; color: #555;">
        <li style="margin-bottom: 12px; font-size: 15px;">Criar e gerenciar seus projetos de pesquisa de mercado</li>
        <li style="margin-bottom: 12px; font-size: 15px;">Importar e enriquecer bases de clientes e leads</li>
        <li style="margin-bottom: 12px; font-size: 15px;">Analisar concorrentes e identificar oportunidades</li>
        <li style="margin-bottom: 0; font-size: 15px;">Gerar relatórios detalhados para tomada de decisão</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 35px 0;">
      <a href="${APP_URL}/login" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 35px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
        Acessar Plataforma
      </a>
    </div>
    
    <p style="font-size: 15px; color: #666; margin: 30px 0 0 0; padding-top: 25px; border-top: 1px solid #e0e0e0;">
      Se tiver dúvidas ou precisar de ajuda, estamos à disposição. Basta responder este email.
    </p>
    
    <p style="font-size: 15px; color: #666; margin: 20px 0 0 0;">
      Abraço,<br>
      <strong style="color: #333;">Equipe Intelmarket</strong>
    </p>
  </div>
  
  <!-- Footer -->
  <div style="background: #f8f9fa; padding: 25px 30px; text-align: center; color: #999; font-size: 13px;">
    <p style="margin: 0 0 8px 0;">
      © ${new Date().getFullYear()} Intelmarket - Inteligência de Mercado
    </p>
    <p style="margin: 0;">
      <a href="${APP_URL}" style="color: #667eea; text-decoration: none;">intelmarket.app</a>
    </p>
  </div>
</body>
</html>
  `;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject,
      html,
    });

    console.log('[UserNotifications] Email de aprovação enviado:', {
      email,
      messageId: result.data?.id,
    });

    return result;
  } catch (error) {
    console.error('[UserNotifications] Erro ao enviar email de aprovação:', error);
    throw error;
  }
}

/**
 * Envia email de rejeição de cadastro
 */
export async function sendUserRejectedEmail(email: string, nome: string, motivo?: string) {
  const primeiroNome = nome.split(' ')[0];
  const subject = `Sobre seu cadastro no Intelmarket`;

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f5f5f5;">
  
  <!-- Header -->
  <div style="background: #6c757d; padding: 40px 30px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Intelmarket</h1>
  </div>
  
  <!-- Body -->
  <div style="background: white; padding: 40px 30px;">
    <p style="font-size: 16px; margin: 0 0 20px 0; color: #333;">
      Olá ${primeiroNome},
    </p>
    
    <p style="font-size: 16px; margin: 0 0 25px 0; color: #333;">
      Agradecemos seu interesse no Intelmarket. Após análise do seu cadastro, 
      identificamos que não será possível liberar o acesso neste momento.
    </p>
    
    ${
      motivo
        ? `
    <div style="background: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 25px 0; border-radius: 4px;">
      <p style="margin: 0; color: #856404; font-size: 15px; line-height: 1.6;">
        <strong>Motivo:</strong><br>
        ${motivo}
      </p>
    </div>
    `
        : `
    <p style="font-size: 16px; margin: 0 0 25px 0; color: #333;">
      Nossa equipe analisou as informações fornecidas e, por questões de política interna, 
      não foi possível aprovar o cadastro no momento.
    </p>
    `
    }
    
    <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 30px 0;">
      <h2 style="margin: 0 0 15px 0; color: #6c757d; font-size: 18px; font-weight: 600;">Precisa de mais informações?</h2>
      <p style="margin: 0 0 15px 0; color: #555; font-size: 15px;">
        Se você acredita que houve algum equívoco ou gostaria de entender melhor a decisão, 
        entre em contato conosco. Estamos à disposição para esclarecer qualquer dúvida.
      </p>
      <p style="margin: 0; color: #555; font-size: 15px;">
        Basta responder este email ou enviar uma mensagem para <a href="mailto:${FROM_EMAIL}" style="color: #667eea; text-decoration: none;">${FROM_EMAIL}</a>
      </p>
    </div>
    
    <p style="font-size: 15px; color: #666; margin: 30px 0 0 0; padding-top: 25px; border-top: 1px solid #e0e0e0;">
      Agradecemos sua compreensão.
    </p>
    
    <p style="font-size: 15px; color: #666; margin: 20px 0 0 0;">
      Atenciosamente,<br>
      <strong style="color: #333;">Equipe Intelmarket</strong>
    </p>
  </div>
  
  <!-- Footer -->
  <div style="background: #f8f9fa; padding: 25px 30px; text-align: center; color: #999; font-size: 13px;">
    <p style="margin: 0 0 8px 0;">
      © ${new Date().getFullYear()} Intelmarket - Inteligência de Mercado
    </p>
    <p style="margin: 0;">
      <a href="${APP_URL}" style="color: #667eea; text-decoration: none;">intelmarket.app</a> | 
      <a href="mailto:${FROM_EMAIL}" style="color: #667eea; text-decoration: none;">${FROM_EMAIL}</a>
    </p>
  </div>
</body>
</html>
  `;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject,
      html,
    });

    console.log('[UserNotifications] Email de rejeição enviado:', {
      email,
      messageId: result.data?.id,
    });

    return result;
  } catch (error) {
    console.error('[UserNotifications] Erro ao enviar email de rejeição:', error);
    throw error;
  }
}
