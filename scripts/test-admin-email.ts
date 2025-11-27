/**
 * Script para testar envio de email de notificação para admin
 *
 * Como usar:
 * 1. Certifique-se que .env.local tem RESEND_API_KEY
 * 2. Execute: npx tsx scripts/test-admin-email.ts
 */

import { Resend } from 'resend';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Carregar variáveis de ambiente
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'contato@intelmarket.app';
const ADMIN_EMAILS = ['sandrodireto@gmail.com'];

async function testAdminNotification() {
  console.log('🧪 TESTE DE EMAIL DE NOTIFICAÇÃO PARA ADMIN\n');
  console.log('📧 Configuração:');
  console.log(`   FROM: ${FROM_EMAIL}`);
  console.log(`   TO: ${ADMIN_EMAILS.join(', ')}`);
  console.log(
    `   API KEY: ${process.env.RESEND_API_KEY ? '✅ Configurada' : '❌ Não encontrada'}\n`
  );

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ ERRO: RESEND_API_KEY não encontrada no .env.local');
    process.exit(1);
  }

  // Dados de teste
  const testUser = {
    nome: 'Usuário Teste',
    email: 'teste@example.com',
    empresa: 'Empresa Teste LTDA',
    cargo: 'Gerente de Vendas',
    setor: 'Comercial',
    userId: 'test-user-id-123',
  };

  console.log('👤 Dados do usuário de teste:');
  console.log(`   Nome: ${testUser.nome}`);
  console.log(`   Email: ${testUser.email}`);
  console.log(`   Empresa: ${testUser.empresa}`);
  console.log(`   Cargo: ${testUser.cargo}`);
  console.log(`   Setor: ${testUser.setor}\n`);

  const approveUrl = `https://www.intelmarket.app/admin/users/${testUser.userId}/approve`;

  const emailTemplate = {
    subject: '🔔 Novo Cadastro Pendente - IntelMarket',
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Novo Cadastro Pendente</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                🔔 Novo Cadastro Pendente
              </h1>
              <p style="margin: 10px 0 0 0; color: #fef3c7; font-size: 14px;">
                Ação necessária: Aprovar ou rejeitar usuário
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Um novo usuário solicitou acesso à plataforma IntelMarket. Revise as informações abaixo e aprove ou rejeite o cadastro.
              </p>

              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px;">
                  📋 Informações do Usuário
                </h3>
                
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #6b7280; font-size: 14px; font-weight: 600; width: 140px;">Nome:</td>
                    <td style="color: #1f2937; font-size: 14px;">${testUser.nome}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-size: 14px; font-weight: 600;">Email:</td>
                    <td style="color: #1f2937; font-size: 14px;">${testUser.email}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-size: 14px; font-weight: 600;">Empresa:</td>
                    <td style="color: #1f2937; font-size: 14px;">${testUser.empresa}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-size: 14px; font-weight: 600;">Cargo:</td>
                    <td style="color: #1f2937; font-size: 14px;">${testUser.cargo}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-size: 14px; font-weight: 600;">Setor:</td>
                    <td style="color: #1f2937; font-size: 14px;">${testUser.setor}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-size: 14px; font-weight: 600;">Data:</td>
                    <td style="color: #1f2937; font-size: 14px;">${new Date().toLocaleString('pt-BR')}</td>
                  </tr>
                </table>
              </div>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${approveUrl}" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);">
                  ✅ Aprovar Usuário
                </a>
              </div>

              <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; text-align: center; line-height: 1.6;">
                Ou acesse o painel administrativo para gerenciar usuários pendentes
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                © ${new Date().getFullYear()} IntelMarket. Todos os direitos reservados.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Este é um email automático, por favor não responda.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };

  console.log('📤 Enviando email...\n');

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAILS,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    if (error) {
      console.error('❌ ERRO ao enviar email:');
      console.error(JSON.stringify(error, null, 2));
      process.exit(1);
    }

    console.log('✅ EMAIL ENVIADO COM SUCESSO!\n');
    console.log('📊 Resposta da API:');
    console.log(JSON.stringify(data, null, 2));
    console.log('\n🎉 Verifique sua caixa de entrada em:', ADMIN_EMAILS.join(', '));
    console.log('📬 Não esqueça de verificar a pasta de SPAM também!');
  } catch (error) {
    console.error('❌ ERRO INESPERADO:');
    console.error(error);
    process.exit(1);
  }
}

// Executar teste
testAdminNotification();
