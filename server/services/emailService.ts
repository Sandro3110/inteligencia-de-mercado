import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'contato@intelmarket.app';
const ADMIN_EMAILS = ['contato@intelmarket.app']; // Email padrão para notificações de novos usuários

// ============================================================================
// TEMPLATES DE EMAIL
// ============================================================================

/**
 * Template de boas-vindas para novo usuário (aguardando aprovação)
 */
function getWelcomeEmailTemplate(userName: string, userEmail: string) {
  return {
    subject: '🎉 Bem-vindo ao IntelMarket - Cadastro Recebido',
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo ao IntelMarket</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">
                IntelMarket
              </h1>
              <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 16px;">
                Inteligência de Mercado e Análise Territorial
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">
                Olá, ${userName}! 👋
              </h2>
              
              <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Recebemos seu cadastro na plataforma <strong>IntelMarket</strong> com sucesso!
              </p>

              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                  <strong>📧 Email cadastrado:</strong> ${userEmail}
                </p>
              </div>

              <h3 style="margin: 32px 0 16px 0; color: #1f2937; font-size: 18px;">
                📋 Próximos Passos
              </h3>

              <ol style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 15px; line-height: 1.8;">
                <li style="margin-bottom: 12px;">
                  <strong>Aguarde a aprovação:</strong> Nossa equipe de administradores foi notificada e irá revisar seu cadastro em breve.
                </li>
                <li style="margin-bottom: 12px;">
                  <strong>Receba o email de aprovação:</strong> Assim que seu acesso for liberado, você receberá um email de confirmação com o link para acessar a plataforma.
                </li>
                <li style="margin-bottom: 12px;">
                  <strong>Faça login:</strong> Use suas credenciais para acessar todas as funcionalidades do IntelMarket.
                </li>
              </ol>

              <h3 style="margin: 32px 0 16px 0; color: #1f2937; font-size: 18px;">
                🚀 O que é o IntelMarket?
              </h3>

              <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                O <strong>IntelMarket</strong> é uma plataforma completa de inteligência de mercado e análise territorial que oferece:
              </p>

              <ul style="margin: 0 0 24px 0; padding-left: 20px; color: #4b5563; font-size: 15px; line-height: 1.8;">
                <li style="margin-bottom: 8px;">📊 <strong>Dashboard inteligente</strong> com métricas em tempo real</li>
                <li style="margin-bottom: 8px;">📂 <strong>Gestão de projetos</strong> e pesquisas de mercado</li>
                <li style="margin-bottom: 8px;">🗺️ <strong>Análise geoespacial</strong> e mapas interativos</li>
                <li style="margin-bottom: 8px;">👥 <strong>Gestão de leads</strong> e oportunidades</li>
                <li style="margin-bottom: 8px;">🌍 <strong>Inteligência de mercados</strong> e territórios</li>
                <li style="margin-bottom: 8px;">✨ <strong>Enriquecimento de dados</strong> automatizado</li>
              </ul>

              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                  <strong>⏱️ Tempo estimado de aprovação:</strong> Geralmente processamos novos cadastros em até 24 horas úteis.
                </p>
              </div>

              <p style="margin: 32px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Se tiver alguma dúvida, responda este email ou entre em contato conosco.
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
}

/**
 * Template de notificação para administradores sobre novo cadastro
 */
function getAdminNotificationTemplate(
  userName: string,
  userEmail: string,
  userCompany: string,
  userRole: string,
  userDepartment: string,
  userId: string
) {
  const approveUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/users/${userId}/approve`;

  return {
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
                    <td style="color: #1f2937; font-size: 14px;">${userName}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-size: 14px; font-weight: 600;">Email:</td>
                    <td style="color: #1f2937; font-size: 14px;">${userEmail}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-size: 14px; font-weight: 600;">Empresa:</td>
                    <td style="color: #1f2937; font-size: 14px;">${userCompany}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-size: 14px; font-weight: 600;">Cargo:</td>
                    <td style="color: #1f2937; font-size: 14px;">${userRole}</td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-size: 14px; font-weight: 600;">Setor:</td>
                    <td style="color: #1f2937; font-size: 14px;">${userDepartment}</td>
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
}

/**
 * Template de aprovação para usuário
 */
function getApprovalEmailTemplate(userName: string) {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login`;

  return {
    subject: '✅ Seu Acesso ao IntelMarket Foi Aprovado!',
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Acesso Aprovado</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
              <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                Acesso Aprovado!
              </h1>
              <p style="margin: 10px 0 0 0; color: #d1fae5; font-size: 16px;">
                Bem-vindo ao IntelMarket
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">
                Parabéns, ${userName}! 🎉
              </h2>
              
              <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Seu cadastro foi <strong>aprovado</strong> e você já pode acessar todas as funcionalidades da plataforma IntelMarket!
              </p>

              <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0; color: #065f46; font-size: 14px; line-height: 1.6;">
                  <strong>🎯 Você agora tem acesso completo à plataforma!</strong>
                </p>
              </div>

              <h3 style="margin: 32px 0 16px 0; color: #1f2937; font-size: 18px;">
                🚀 Como Começar
              </h3>

              <ol style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 15px; line-height: 1.8;">
                <li style="margin-bottom: 12px;">
                  <strong>Acesse a plataforma:</strong> Clique no botão abaixo para fazer login
                </li>
                <li style="margin-bottom: 12px;">
                  <strong>Configure seu perfil:</strong> Complete suas informações pessoais
                </li>
                <li style="margin-bottom: 12px;">
                  <strong>Explore as funcionalidades:</strong> Navegue pelo dashboard e descubra todas as ferramentas
                </li>
                <li style="margin-bottom: 12px;">
                  <strong>Crie seu primeiro projeto:</strong> Comece a usar o IntelMarket para suas análises
                </li>
              </ol>

              <div style="text-align: center; margin: 40px 0;">
                <a href="${loginUrl}" style="display: inline-block; background-color: #667eea; color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 6px; font-size: 18px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                  🔐 Acessar IntelMarket
                </a>
              </div>

              <h3 style="margin: 32px 0 16px 0; color: #1f2937; font-size: 18px;">
                📚 Recursos Disponíveis
              </h3>

              <div style="display: grid; gap: 16px;">
                <div style="background-color: #f9fafb; border-radius: 6px; padding: 16px;">
                  <p style="margin: 0; color: #1f2937; font-size: 15px; font-weight: 600;">📊 Dashboard Inteligente</p>
                  <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">Visualize métricas e KPIs em tempo real</p>
                </div>
                
                <div style="background-color: #f9fafb; border-radius: 6px; padding: 16px;">
                  <p style="margin: 0; color: #1f2937; font-size: 15px; font-weight: 600;">📂 Gestão de Projetos</p>
                  <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">Organize e acompanhe seus projetos de pesquisa</p>
                </div>
                
                <div style="background-color: #f9fafb; border-radius: 6px; padding: 16px;">
                  <p style="margin: 0; color: #1f2937; font-size: 15px; font-weight: 600;">🗺️ Análise Geoespacial</p>
                  <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">Mapas interativos e análise territorial</p>
                </div>
                
                <div style="background-color: #f9fafb; border-radius: 6px; padding: 16px;">
                  <p style="margin: 0; color: #1f2937; font-size: 15px; font-weight: 600;">👥 Gestão de Leads</p>
                  <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">Gerencie oportunidades e pipeline de vendas</p>
                </div>
              </div>

              <p style="margin: 32px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Se precisar de ajuda, nossa equipe de suporte está à disposição. Responda este email ou acesse a central de ajuda na plataforma.
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
}

// ============================================================================
// FUNÇÕES DE ENVIO
// ============================================================================

/**
 * Envia email de boas-vindas para novo usuário
 */
export async function sendWelcomeEmail(userName: string, userEmail: string) {
  try {
    const template = getWelcomeEmailTemplate(userName, userEmail);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: template.subject,
      html: template.html,
    });

    if (error) {
      console.error('Erro ao enviar email de boas-vindas:', error);
      throw error;
    }

    console.log('Email de boas-vindas enviado:', data);
    return data;
  } catch (error) {
    console.error('Erro ao enviar email de boas-vindas:', error);
    throw error;
  }
}

/**
 * Envia notificação para administradores sobre novo cadastro
 */
export async function sendAdminNotification(
  userName: string,
  userEmail: string,
  userCompany: string,
  userRole: string,
  userDepartment: string,
  userId: string
) {
  console.log('🔔 [sendAdminNotification] Iniciando envio de notificação para admin');
  console.log('📧 [sendAdminNotification] Destinatários:', ADMIN_EMAILS);
  console.log('📤 [sendAdminNotification] Remetente:', FROM_EMAIL);
  console.log('👤 [sendAdminNotification] Usuário:', userName, '(' + userEmail + ')');

  try {
    const template = getAdminNotificationTemplate(
      userName,
      userEmail,
      userCompany,
      userRole,
      userDepartment,
      userId
    );

    console.log('📝 [sendAdminNotification] Template gerado, assunto:', template.subject);
    console.log('📤 [sendAdminNotification] Chamando Resend API...');

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAILS,
      subject: template.subject,
      html: template.html,
    });

    if (error) {
      console.error('❌ [sendAdminNotification] ERRO ao enviar notificação:');
      console.error('❌ [sendAdminNotification] Detalhes:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log('✅ [sendAdminNotification] Notificação enviada com sucesso!');
    console.log('📊 [sendAdminNotification] Resposta:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('❌ [sendAdminNotification] EXCEÇÃO capturada:', error);
    throw error;
  }
}

/**
 * Envia email de aprovação para usuário
 */
export async function sendApprovalEmail(userName: string, userEmail: string) {
  try {
    const template = getApprovalEmailTemplate(userName);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: userEmail,
      subject: template.subject,
      html: template.html,
    });

    if (error) {
      console.error('Erro ao enviar email de aprovação:', error);
      throw error;
    }

    console.log('Email de aprovação enviado:', data);
    return data;
  } catch (error) {
    console.error('Erro ao enviar email de aprovação:', error);
    throw error;
  }
}
