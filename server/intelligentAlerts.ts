/**
 * Sistema de Alertas Inteligentes
 *
 * Monitora métricas do enriquecimento e dispara alertas quando:
 * - Circuit breaker abre (10+ falhas consecutivas)
 * - Taxa de erro ultrapassa 10%
 * - Enriquecimento é concluído
 * - Tempo de processamento excede threshold
 */

import { notifyOwner } from "./_core/notification";
import { getWebSocketManager } from "./websocket";

export interface AlertConfig {
  projectId: number;
  circuitBreakerThreshold: number;
  errorRateThreshold: number;
  processingTimeThreshold: number; // em segundos
  notifyOnCompletion: boolean;
}

export interface EnrichmentMetrics {
  projectId: number;
  totalClients: number;
  processedClients: number;
  successCount: number;
  errorCount: number;
  avgProcessingTime: number;
  circuitBreakerFailures: number;
  isCompleted: boolean;
}

// Cache de alertas já disparados (evita spam)
const alertCache = new Map<string, number>();
const ALERT_COOLDOWN = 5 * 60 * 1000; // 5 minutos

function shouldSendAlert(alertKey: string): boolean {
  const lastSent = alertCache.get(alertKey);
  if (!lastSent) return true;

  const now = Date.now();
  if (now - lastSent > ALERT_COOLDOWN) {
    return true;
  }

  return false;
}

function markAlertSent(alertKey: string) {
  alertCache.set(alertKey, Date.now());
}

/**
 * Verifica métricas e dispara alertas quando necessário
 */
export async function checkAndSendAlerts(
  metrics: EnrichmentMetrics,
  config: AlertConfig
): Promise<void> {
  const { projectId } = metrics;

  // 1. Alerta de Circuit Breaker
  if (metrics.circuitBreakerFailures >= config.circuitBreakerThreshold) {
    const alertKey = `circuit-breaker-${projectId}`;
    if (shouldSendAlert(alertKey)) {
      await notifyOwner({
        title: "⚠️ Circuit Breaker Ativado",
        content: `O circuit breaker foi ativado no projeto ${projectId} após ${metrics.circuitBreakerFailures} falhas consecutivas. O enriquecimento foi pausado automaticamente para evitar sobrecarga.`,
      });

      // Enviar via WebSocket
      const wsManager = getWebSocketManager();
      if (wsManager) {
        wsManager.broadcast({
          id: `circuit-breaker-${projectId}-${Date.now()}`,
          type: "quality_alert",
          title: "⚠️ Circuit Breaker Ativado",
          message: `Circuit breaker ativado no projeto ${projectId} após ${metrics.circuitBreakerFailures} falhas consecutivas.`,
          timestamp: new Date(),
          data: { projectId, failures: metrics.circuitBreakerFailures },
          read: false,
        });
      }

      markAlertSent(alertKey);
      console.log(
        `[IntelligentAlerts] Circuit breaker alert sent for project ${projectId}`
      );
    }
  }

  // 2. Alerta de Taxa de Erro Alta
  const errorRate =
    metrics.processedClients > 0
      ? (metrics.errorCount / metrics.processedClients) * 100
      : 0;

  if (errorRate > config.errorRateThreshold) {
    const alertKey = `error-rate-${projectId}`;
    if (shouldSendAlert(alertKey)) {
      await notifyOwner({
        title: "⚠️ Taxa de Erro Elevada",
        content: `A taxa de erro no projeto ${projectId} atingiu ${errorRate.toFixed(1)}% (${metrics.errorCount} erros em ${metrics.processedClients} processados). Verifique os logs para identificar o problema.`,
      });

      // Enviar via WebSocket
      const wsManager = getWebSocketManager();
      if (wsManager) {
        wsManager.broadcast({
          id: `error-rate-${projectId}-${Date.now()}`,
          type: "quality_alert",
          title: "⚠️ Taxa de Erro Elevada",
          message: `Taxa de erro no projeto ${projectId}: ${errorRate.toFixed(1)}% (${metrics.errorCount} erros).`,
          timestamp: new Date(),
          data: { projectId, errorRate, errorCount: metrics.errorCount },
          read: false,
        });
      }

      markAlertSent(alertKey);
      console.log(
        `[IntelligentAlerts] Error rate alert sent for project ${projectId}: ${errorRate.toFixed(1)}%`
      );
    }
  }

  // 3. Alerta de Tempo de Processamento Longo
  if (metrics.avgProcessingTime > config.processingTimeThreshold) {
    const alertKey = `processing-time-${projectId}`;
    if (shouldSendAlert(alertKey)) {
      await notifyOwner({
        title: "⏱️ Tempo de Processamento Elevado",
        content: `O tempo médio de processamento no projeto ${projectId} está em ${metrics.avgProcessingTime}s, acima do threshold de ${config.processingTimeThreshold}s. Considere otimizar as consultas ou aumentar recursos.`,
      });
      markAlertSent(alertKey);
      console.log(
        `[IntelligentAlerts] Processing time alert sent for project ${projectId}: ${metrics.avgProcessingTime}s`
      );
    }
  }

  // 4. Alerta de Conclusão
  if (metrics.isCompleted && config.notifyOnCompletion) {
    const alertKey = `completion-${projectId}-${metrics.processedClients}`;
    if (shouldSendAlert(alertKey)) {
      const successRate = (
        (metrics.successCount / metrics.processedClients) *
        100
      ).toFixed(1);
      await notifyOwner({
        title: "✅ Enriquecimento Concluído",
        content:
          `O enriquecimento do projeto ${projectId} foi concluído com sucesso!\n\n` +
          `📊 Estatísticas:\n` +
          `- Total processado: ${metrics.processedClients} clientes\n` +
          `- Taxa de sucesso: ${successRate}%\n` +
          `- Erros: ${metrics.errorCount}\n` +
          `- Tempo médio: ${metrics.avgProcessingTime}s por cliente`,
      });
      markAlertSent(alertKey);
      console.log(
        `[IntelligentAlerts] Completion alert sent for project ${projectId}`
      );
    }
  }
}

/**
 * Configuração padrão de alertas
 */
export function getDefaultAlertConfig(projectId: number): AlertConfig {
  return {
    projectId,
    circuitBreakerThreshold: 10,
    errorRateThreshold: 10, // 10%
    processingTimeThreshold: 60, // 60 segundos
    notifyOnCompletion: true,
  };
}

/**
 * Limpa cache de alertas antigos (executar periodicamente)
 */
export function cleanAlertCache() {
  const now = Date.now();
  const entriesToDelete: string[] = [];

  alertCache.forEach((timestamp, key) => {
    if (now - timestamp > ALERT_COOLDOWN * 2) {
      entriesToDelete.push(key);
    }
  });

  entriesToDelete.forEach(key => alertCache.delete(key));
  console.log(
    `[IntelligentAlerts] Cache cleaned: ${alertCache.size} entries remaining`
  );
}

// Limpar cache a cada 10 minutos
setInterval(cleanAlertCache, 10 * 60 * 1000);
