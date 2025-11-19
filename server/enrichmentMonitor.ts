/**
 * Monitor de Progresso do Enriquecimento
 * 
 * Monitora o progresso em tempo real e envia notificações automáticas
 * nos marcos de 50%, 75% e 100%
 */

import { getEnrichmentProgress } from './db';
import { updateEnrichmentRun } from './db';
import { notifyOwner } from './_core/notification';

type NotificationMilestone = {
  percentage: number;
  field: 'notifiedAt50' | 'notifiedAt75' | 'notifiedAt100';
  title: string;
  emoji: string;
};

const MILESTONES: NotificationMilestone[] = [
  { percentage: 50, field: 'notifiedAt50', title: 'Metade Concluída', emoji: '🎯' },
  { percentage: 75, field: 'notifiedAt75', title: '75% Concluído', emoji: '🚀' },
];

/**
 * Verifica progresso e envia notificações se necessário
 */
export async function checkProgressAndNotify(
  projectId: number,
  runId: number,
  projectName: string
): Promise<void> {
  try {
    const progress = await getEnrichmentProgress(projectId);
    
    for (const milestone of MILESTONES) {
      // Verificar se atingiu o marco e ainda não foi notificado
      if (progress.percentage >= milestone.percentage) {
        // Buscar run atual para verificar se já foi notificado
        const { getActiveEnrichmentRun } = await import('./db');
        const run = await getActiveEnrichmentRun(projectId);
        
        if (!run) continue;
        
        const alreadyNotified = run[milestone.field] === 1;
        
        if (!alreadyNotified) {
          // Enviar notificação
          await notifyOwner({
            title: `${milestone.emoji} ${milestone.title} - ${projectName}`,
            content: `O enriquecimento atingiu ${milestone.percentage}% de conclusão!\n\n• ${progress.processed} de ${progress.total} clientes processados\n• ${progress.stats.mercados} mercados identificados\n• ${progress.stats.concorrentes} concorrentes encontrados\n• ${progress.stats.leads} leads gerados`,
          });
          
          // Marcar como notificado
          await updateEnrichmentRun(runId, {
            [milestone.field]: 1,
          });
          
          console.log(`[Monitor] Notificação enviada: ${milestone.percentage}% - Projeto ${projectId}`);
        }
      }
    }
  } catch (error) {
    console.error('[Monitor] Erro ao verificar progresso:', error);
  }
}

/**
 * Inicia monitoramento contínuo do progresso
 * Verifica a cada 30 segundos
 */
export function startProgressMonitoring(
  projectId: number,
  runId: number,
  projectName: string
): NodeJS.Timeout {
  console.log(`[Monitor] Iniciando monitoramento do projeto ${projectId}, run ${runId}`);
  
  // Verificar imediatamente
  checkProgressAndNotify(projectId, runId, projectName);
  
  // Verificar a cada 30 segundos
  const intervalId = setInterval(() => {
    checkProgressAndNotify(projectId, runId, projectName);
  }, 30000); // 30 segundos
  
  return intervalId;
}

/**
 * Para o monitoramento
 */
export function stopProgressMonitoring(intervalId: NodeJS.Timeout): void {
  clearInterval(intervalId);
  console.log('[Monitor] Monitoramento parado');
}
