/**
 * Templates de email profissionais para o sistema de autenticação
 */

interface InviteEmailData {
  recipientName: string;
  inviterName: string;
  inviteUrl: string;
  expiresInDays: number;
  role: "admin" | "visualizador";
}

interface ApprovalEmailData {
  userName: string;
  approverName: string;
  loginUrl: string;
}

interface RejectionEmailData {
  userName: string;
  reason?: string;
}

/**
 * Template base para todos os emails
 */
function getBaseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Intelmarket</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: #ffffff;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
    }
    .content h2 {
      color: #1e40af;
      font-size: 22px;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .content p {
      margin: 16px 0;
      color: #4b5563;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 24px 0;
      transition: transform 0.2s;
    }
    .button:hover {
      transform: translateY(-2px);
    }
    .info-box {
      background-color: #f0f9ff;
      border-left: 4px solid #3b82f6;
      padding: 16px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .info-box p {
      margin: 8px 0;
      color: #1e40af;
    }
    .footer {
      background-color: #f9fafb;
      padding: 24px 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 8px 0;
      color: #6b7280;
      font-size: 14px;
    }
    .divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 24px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Intelmarket</h1>
      <p style="margin: 8px 0 0 0; opacity: 0.9;">Sistema de Inteligência de Mercado PAV</p>
    </div>
    ${content}
    <div class="footer">
      <p><strong>Intelmarket</strong> - Sistema de Inteligência de Mercado</p>
      <p>Este é um email automático. Por favor, não responda.</p>
      <p style="font-size: 12px; color: #9ca3af; margin-top: 16px;">
        © ${new Date().getFullYear()} PAV - Plano de Aceleração de Vendas. Todos os direitos reservados.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Email de convite para novo usuário
 */
export function getInviteEmailTemplate(data: InviteEmailData): {
  subject: string;
  html: string;
} {
  const roleLabel = data.role === "admin" ? "Administrador" : "Visualizador";
  
  const content = `
    <div class="content">
      <h2>Você foi convidado para o Intelmarket! 🎉</h2>
      <p>Olá <strong>${data.recipientName}</strong>,</p>
      <p>
        <strong>${data.inviterName}</strong> convidou você para fazer parte do 
        <strong>Intelmarket</strong>, nosso sistema de inteligência de mercado.
      </p>
      
      <div class="info-box">
        <p><strong>Perfil atribuído:</strong> ${roleLabel}</p>
        <p><strong>Validade do convite:</strong> ${data.expiresInDays} dias</p>
      </div>

      <p>Para aceitar o convite e criar sua conta, clique no botão abaixo:</p>
      
      <div style="text-align: center;">
        <a href="${data.inviteUrl}" class="button">Aceitar Convite e Criar Conta</a>
      </div>

      <p style="font-size: 14px; color: #6b7280; margin-top: 32px;">
        Ou copie e cole este link no seu navegador:<br>
        <span style="word-break: break-all; color: #3b82f6;">${data.inviteUrl}</span>
      </p>

      <div class="divider"></div>

      <p style="font-size: 14px; color: #6b7280;">
        <strong>Importante:</strong> Após criar sua conta, você precisará aguardar a aprovação 
        de um administrador antes de poder acessar o sistema.
      </p>
    </div>
  `;

  return {
    subject: `Convite para o Intelmarket - ${roleLabel}`,
    html: getBaseTemplate(content),
  };
}

/**
 * Email de aprovação de cadastro
 */
export function getApprovalEmailTemplate(data: ApprovalEmailData): {
  subject: string;
  html: string;
} {
  const content = `
    <div class="content">
      <h2>Sua conta foi aprovada! ✅</h2>
      <p>Olá <strong>${data.userName}</strong>,</p>
      <p>
        Ótimas notícias! Sua conta no <strong>Intelmarket</strong> foi aprovada por 
        <strong>${data.approverName}</strong>.
      </p>
      
      <p>Agora você já pode acessar o sistema e começar a utilizar todas as funcionalidades disponíveis.</p>

      <div style="text-align: center;">
        <a href="${data.loginUrl}" class="button">Acessar o Sistema</a>
      </div>

      <div class="info-box">
        <p><strong>O que você pode fazer agora:</strong></p>
        <p>✓ Fazer login com seu email e senha</p>
        <p>✓ Explorar projetos e pesquisas</p>
        <p>✓ Visualizar dados de mercado</p>
        <p>✓ Gerar relatórios e análises</p>
      </div>

      <p style="font-size: 14px; color: #6b7280; margin-top: 32px;">
        Caso tenha esquecido sua senha, você pode redefini-la na tela de login.
      </p>
    </div>
  `;

  return {
    subject: "Sua conta no Intelmarket foi aprovada!",
    html: getBaseTemplate(content),
  };
}

/**
 * Email de rejeição de cadastro
 */
export function getRejectionEmailTemplate(data: RejectionEmailData): {
  subject: string;
  html: string;
} {
  const content = `
    <div class="content">
      <h2>Atualização sobre seu cadastro</h2>
      <p>Olá <strong>${data.userName}</strong>,</p>
      <p>
        Informamos que seu cadastro no <strong>Intelmarket</strong> não foi aprovado neste momento.
      </p>
      
      ${data.reason ? `
      <div class="info-box">
        <p><strong>Motivo:</strong></p>
        <p>${data.reason}</p>
      </div>
      ` : ''}

      <p>
        Se você acredita que houve um erro ou gostaria de mais informações, 
        por favor entre em contato com o administrador do sistema.
      </p>

      <div class="divider"></div>

      <p style="font-size: 14px; color: #6b7280;">
        Agradecemos seu interesse no Intelmarket.
      </p>
    </div>
  `;

  return {
    subject: "Atualização sobre seu cadastro no Intelmarket",
    html: getBaseTemplate(content),
  };
}

/**
 * Email de boas-vindas (enviado após primeiro login)
 */
export function getWelcomeEmailTemplate(userName: string): {
  subject: string;
  html: string;
} {
  const content = `
    <div class="content">
      <h2>Bem-vindo ao Intelmarket! 🚀</h2>
      <p>Olá <strong>${userName}</strong>,</p>
      <p>
        É um prazer tê-lo conosco! Você acaba de fazer seu primeiro acesso ao 
        <strong>Intelmarket</strong>, nosso sistema de inteligência de mercado.
      </p>

      <div class="info-box">
        <p><strong>Recursos disponíveis:</strong></p>
        <p>📊 Dashboard com métricas em tempo real</p>
        <p>🔍 Pesquisas de mercado detalhadas</p>
        <p>🏢 Gestão de clientes e concorrentes</p>
        <p>📈 Análises e relatórios personalizados</p>
        <p>🗺️ Visualização geográfica de dados</p>
      </div>

      <p>
        Explore o sistema e descubra como o Intelmarket pode ajudar você a 
        tomar decisões mais inteligentes e estratégicas.
      </p>

      <div class="divider"></div>

      <p style="font-size: 14px; color: #6b7280;">
        <strong>Precisa de ajuda?</strong><br>
        Entre em contato com o administrador do sistema para suporte e treinamento.
      </p>
    </div>
  `;

  return {
    subject: "Bem-vindo ao Intelmarket!",
    html: getBaseTemplate(content),
  };
}
