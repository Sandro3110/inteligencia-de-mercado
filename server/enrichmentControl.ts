import { logger } from '@/lib/logger';

/**
 * Controle de Execução do Enriquecimento
 *
 * Gerencia estado de pausa/retomada do processamento
 */

type EnrichmentState = {
  isPaused: boolean;
  projectId: number | null;
  runId: number | null;
};

// Estado global (em memória)
const state: EnrichmentState = {
  isPaused: false,
  projectId: null,
  runId: null,
};

/**
 * Verifica se o enriquecimento deve pausar
 */
export function shouldPause(): boolean {
  return state.isPaused;
}

/**
 * Pausa o enriquecimento
 */
export async function pauseEnrichment(projectId: number, runId: number): Promise<void> {
  state.isPaused = true;
  state.projectId = projectId;
  state.runId = runId;

  // Atualizar status no banco
  const { updateEnrichmentRun } = await import('./db');
  await updateEnrichmentRun(runId, {
    status: 'paused',
  });

  logger.debug(`[Control] Enriquecimento pausado - Projeto ${projectId}, Run ${runId}`);
}

/**
 * Retoma o enriquecimento
 */
export async function resumeEnrichment(projectId: number, runId: number): Promise<void> {
  state.isPaused = false;
  state.projectId = projectId;
  state.runId = runId;

  // Atualizar status no banco
  const { updateEnrichmentRun } = await import('./db');
  await updateEnrichmentRun(runId, {
    status: 'running',
  });

  logger.debug(`[Control] Enriquecimento retomado - Projeto ${projectId}, Run ${runId}`);
}

/**
 * Retorna estado atual
 */
export function getEnrichmentState(): EnrichmentState {
  return { ...state };
}

/**
 * Reseta estado (usado ao finalizar)
 */
export function resetEnrichmentState(): void {
  state.isPaused = false;
  state.projectId = null;
  state.runId = null;
}
