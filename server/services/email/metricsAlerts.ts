import { Resend } from 'resend';
import { logger } from '@/lib/logger';

const DEFAULT_FROM_EMAIL = 'contato@intelmarket.app';
const ADMIN_EMAILS = ['contato@intelmarket.app'];
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

interface EmailResult {
  success: boolean;
  error?: string;
}

/**
 * Envia alerta de query lenta
 */
export async function sendSlowQueryAlert(
  metricName: string,
  executionTimeMs: number,
  recordCount?: number,
  metadata?: Record<string, unknown>
): Promise<EmailResult> {
  const resend = getResendClient();

  if (!resend) {
    logger.warn('[MetricsAlert] Resend não configurado. Email não enviado.');
    return {
      success: false,
      error: 'Resend API key não configurada',
    };
  }

  try {
    const metricsUrl = `${APP_URL}/admin/metrics`;
    const timeInSeconds = (executionTimeMs / 1000).toFixed(2);

    // Determinar severidade
    const severity =
      executionTimeMs > 10000 ? 'CRÍTICO' : executionTimeMs > 5000 ? 'ALTO' : 'MÉDIO';
    const severityColor =
      executionTimeMs > 10000 ? '#dc2626' : executionTimeMs > 5000 ? '#ea580c' : '#f59e0b';

    // Gerar recomendações
    const recommendations = [];
    if (executionTimeMs > 5000) {
      recommendations.push('Considere adicionar índices nas colunas utilizadas em WHERE e JOIN');
      recommendations.push('Verifique se há N+1 queries que podem ser otimizadas');
    }
    if (recordCount && recordCount > 10000) {
      recommendations.push('Implemente paginação para reduzir a quantidade de dados processados');
      recommendations.push('Considere usar cursor-based pagination para melhor performance');
    }
    if (executionTimeMs > 10000) {
      recommendations.push('URGENTE: Esta query está impactando a experiência do usuário');
      recommendations.push('Considere criar uma stored procedure para otimizar a lógica');
    }

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Alerta de Performance - Intelmarket</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; background: linear-gradient(135deg, ${severityColor} 0%, ${severityColor}dd 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff;">
                ⚠️ Alerta de Performance
              </h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.9);">
                Intelmarket - Sistema de Monitoramento
              </p>
            </td>
          </tr>

          <!-- Severity Badge -->
          <tr>
            <td style="padding: 24px 32px 0;">
              <div style="display: inline-block; padding: 8px 16px; background-color: ${severityColor}; color: #ffffff; border-radius: 6px; font-size: 14px; font-weight: 600;">
                SEVERIDADE: ${severity}
              </div>
            </td>
          </tr>

          <!-- Problem Description -->
          <tr>
            <td style="padding: 24px 32px;">
              <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #111827;">
                🔍 Problema Detectado
              </h2>
              <p style="margin: 0 0 12px; font-size: 15px; line-height: 1.6; color: #374151;">
                Uma query do sistema está executando muito lentamente, o que pode estar impactando a experiência dos usuários e a performance geral da aplicação.
              </p>
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin-top: 16px;">
                <p style="margin: 0; font-size: 14px; color: #92400e;">
                  <strong>⏱️ Tempo de execução:</strong> ${timeInSeconds}s (limite recomendado: 1s)
                </p>
              </div>
            </td>
          </tr>

          <!-- Metric Details -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #111827;">
                📊 Detalhes da Métrica
              </h3>
              <table style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 6px; overflow: hidden;">
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
                    <strong>Query:</strong>
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #111827; font-family: 'Courier New', monospace;">
                    ${metricName}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
                    <strong>Tempo de Execução:</strong>
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #dc2626; font-weight: 600;">
                    ${executionTimeMs}ms (${timeInSeconds}s)
                  </td>
                </tr>
                ${
                  recordCount
                    ? `
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
                    <strong>Registros Processados:</strong>
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #111827;">
                    ${recordCount.toLocaleString('pt-BR')}
                  </td>
                </tr>
                `
                    : ''
                }
                <tr>
                  <td style="padding: 12px 16px; font-size: 14px; color: #6b7280;">
                    <strong>Horário:</strong>
                  </td>
                  <td style="padding: 12px 16px; font-size: 14px; color: #111827;">
                    ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Recommendations -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #111827;">
                💡 Caminhos de Solução
              </h3>
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px;">
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #1e40af;">
                  ${recommendations.map((rec) => `<li style="margin-bottom: 8px;">${rec}</li>`).join('')}
                </ul>
              </div>
            </td>
          </tr>

          <!-- Impact -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #111827;">
                📈 Impacto no Negócio
              </h3>
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #374151;">
                ${
                  executionTimeMs > 10000
                    ? '🔴 <strong>CRÍTICO:</strong> Usuários estão experimentando lentidão significativa. Isso pode resultar em abandono de sessão e insatisfação.'
                    : executionTimeMs > 5000
                      ? '🟠 <strong>ALTO:</strong> A performance está abaixo do ideal. Usuários podem perceber lentidão em algumas operações.'
                      : '🟡 <strong>MÉDIO:</strong> A query está acima do tempo recomendado, mas ainda dentro de limites aceitáveis.'
                }
              </p>
            </td>
          </tr>

          ${
            metadata && Object.keys(metadata).length > 0
              ? `
          <!-- Additional Context -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #111827;">
                🔧 Contexto Adicional
              </h3>
              <pre style="margin: 0; padding: 16px; background-color: #f9fafb; border-radius: 6px; font-size: 12px; color: #374151; overflow-x: auto; font-family: 'Courier New', monospace;">${JSON.stringify(metadata, null, 2)}</pre>
            </td>
          </tr>
          `
              : ''
          }

          <!-- CTA -->
          <tr>
            <td style="padding: 0 32px 32px;">
              <a href="${metricsUrl}" style="display: inline-block; padding: 14px 28px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 600; text-align: center;">
                📊 Ver Dashboard de Métricas
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; font-size: 13px; color: #6b7280; text-align: center;">
                Este é um alerta automático do sistema de monitoramento do Intelmarket.<br>
                Para mais informações, acesse o <a href="${metricsUrl}" style="color: #3b82f6; text-decoration: none;">Dashboard de Métricas</a>.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: ADMIN_EMAILS,
      subject: `⚠️ [${severity}] Query Lenta Detectada - ${metricName}`,
      html,
    });

    if (error) {
      logger.error('[MetricsAlert] Erro ao enviar email:', error);
      return {
        success: false,
        error: error.message || 'Erro desconhecido',
      };
    }

    logger.info('[MetricsAlert] Email de alerta enviado com sucesso:', data?.id);
    return { success: true };
  } catch (error) {
    logger.error('[MetricsAlert] Exceção ao enviar email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Envia alerta de taxa de erro alta
 */
export async function sendHighErrorRateAlert(
  metricName: string,
  errorCount: number,
  totalExecutions: number,
  errorRate: number,
  recentErrors: Array<{ message: string; timestamp: string }>
): Promise<EmailResult> {
  const resend = getResendClient();

  if (!resend) {
    logger.warn('[MetricsAlert] Resend não configurado. Email não enviado.');
    return {
      success: false,
      error: 'Resend API key não configurada',
    };
  }

  try {
    const metricsUrl = `${APP_URL}/admin/metrics`;

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Alerta de Erros - Intelmarket</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; background: linear-gradient(135deg, #dc2626 0%, #dc2626dd 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff;">
                🚨 Alerta de Taxa de Erro Alta
              </h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.9);">
                Intelmarket - Sistema de Monitoramento
              </p>
            </td>
          </tr>

          <!-- Problem Description -->
          <tr>
            <td style="padding: 24px 32px;">
              <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #111827;">
                🔍 Problema Detectado
              </h2>
              <p style="margin: 0 0 12px; font-size: 15px; line-height: 1.6; color: #374151;">
                Uma funcionalidade do sistema está apresentando uma taxa de erro elevada, indicando possíveis problemas de estabilidade ou bugs que precisam de atenção imediata.
              </p>
              <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 16px; border-radius: 4px; margin-top: 16px;">
                <p style="margin: 0; font-size: 14px; color: #991b1b;">
                  <strong>📊 Taxa de Erro:</strong> ${errorRate.toFixed(1)}% (${errorCount} erros em ${totalExecutions} execuções)
                </p>
              </div>
            </td>
          </tr>

          <!-- Metric Details -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #111827;">
                📊 Detalhes da Métrica
              </h3>
              <table style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 6px; overflow: hidden;">
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
                    <strong>Funcionalidade:</strong>
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #111827; font-family: 'Courier New', monospace;">
                    ${metricName}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
                    <strong>Total de Erros:</strong>
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #dc2626; font-weight: 600;">
                    ${errorCount}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
                    <strong>Total de Execuções:</strong>
                  </td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #111827;">
                    ${totalExecutions}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-size: 14px; color: #6b7280;">
                    <strong>Taxa de Erro:</strong>
                  </td>
                  <td style="padding: 12px 16px; font-size: 14px; color: #dc2626; font-weight: 600;">
                    ${errorRate.toFixed(1)}%
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Recent Errors -->
          ${
            recentErrors.length > 0
              ? `
          <tr>
            <td style="padding: 0 32px 24px;">
              <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #111827;">
                🐛 Erros Recentes
              </h3>
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 16px;">
                ${recentErrors
                  .slice(0, 5)
                  .map(
                    (err) => `
                  <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #fecaca;">
                    <p style="margin: 0 0 4px; font-size: 13px; color: #dc2626; font-family: 'Courier New', monospace;">
                      ${err.message}
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #991b1b;">
                      ${new Date(err.timestamp).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                    </p>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </td>
          </tr>
          `
              : ''
          }

          <!-- Recommendations -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #111827;">
                💡 Caminhos de Solução
              </h3>
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px;">
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #1e40af;">
                  <li style="margin-bottom: 8px;">Verifique os logs do servidor para identificar a causa raiz dos erros</li>
                  <li style="margin-bottom: 8px;">Revise mudanças recentes no código que possam ter introduzido bugs</li>
                  <li style="margin-bottom: 8px;">Verifique se há problemas de conexão com banco de dados ou APIs externas</li>
                  <li style="margin-bottom: 8px;">Considere adicionar tratamento de erros mais robusto</li>
                  <li style="margin-bottom: 8px;">Se o problema persistir, considere fazer rollback para versão estável</li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- Impact -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #111827;">
                📈 Impacto no Negócio
              </h3>
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #374151;">
                🔴 <strong>CRÍTICO:</strong> Usuários estão encontrando erros ao usar esta funcionalidade. Isso pode resultar em perda de dados, frustração e abandono da plataforma.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 0 32px 32px;">
              <a href="${metricsUrl}" style="display: inline-block; padding: 14px 28px; background-color: #dc2626; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 600; text-align: center;">
                🔍 Investigar Problema
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; font-size: 13px; color: #6b7280; text-align: center;">
                Este é um alerta automático do sistema de monitoramento do Intelmarket.<br>
                Para mais informações, acesse o <a href="${metricsUrl}" style="color: #3b82f6; text-decoration: none;">Dashboard de Métricas</a>.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: ADMIN_EMAILS,
      subject: `🚨 [CRÍTICO] Taxa de Erro Alta - ${metricName} (${errorRate.toFixed(1)}%)`,
      html,
    });

    if (error) {
      logger.error('[MetricsAlert] Erro ao enviar email:', error);
      return {
        success: false,
        error: error.message || 'Erro desconhecido',
      };
    }

    logger.info('[MetricsAlert] Email de alerta enviado com sucesso:', data?.id);
    return { success: true };
  } catch (error) {
    logger.error('[MetricsAlert] Exceção ao enviar email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}
