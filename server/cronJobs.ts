import { logger } from '@/lib/logger';

import cron from 'node-cron';
import { eq } from 'drizzle-orm';
import { runFullAggregation } from './analyticsAggregation';
import { getDb } from './db';
import { projects } from '../drizzle/schema';

/**
 * Cron Jobs - Tarefas agendadas
 *
 * Jobs configurados:
 * - Agregação diária de métricas de analytics (00:00)
 */

/**
 * Job de agregação diária de métricas
 * Executa todos os dias à meia-noite
 */
export function startAnalyticsAggregationJob() {
  // Executar todos os dias às 00:00 (meia-noite)
  cron.schedule('0 0 * * *', async () => {
    logger.debug('[Cron] Iniciando agregação diária de analytics...');

    try {
      const db = await getDb();
      if (!db) {
        console.error('[Cron] Banco de dados não disponível');
        return;
      }

      // Buscar todos os projetos ativos
      const activeProjects = await db.select().from(projects).where(eq(projects.ativo, 1));

      logger.debug(`[Cron] Encontrados ${activeProjects.length} projetos ativos`);

      // Executar agregação para cada projeto
      for (const project of activeProjects) {
        logger.debug(`[Cron] Agregando métricas do projeto: ${project.nome} (ID: ${project.id})`);

        try {
          await runFullAggregation(project.id);
          logger.debug(`[Cron] ✓ Projeto ${project.nome} agregado com sucesso`);
        } catch (error) {
          console.error(`[Cron] ✗ Erro ao agregar projeto ${project.nome}:`, error);
        }
      }

      logger.debug('[Cron] Agregação diária concluída');
    } catch (error) {
      console.error('[Cron] Erro na agregação diária:', error);
    }
  });

  logger.debug('[Cron] Job de agregação diária iniciado (executa às 00:00)');
}

/**
 * Execução manual de agregação (para testes)
 */
export async function runManualAggregation(projectId: number, pesquisaId?: number) {
  logger.debug(
    `[Manual] Iniciando agregação manual para projeto ${projectId}${pesquisaId ? `, pesquisa ${pesquisaId}` : ''}`
  );

  try {
    await runFullAggregation(projectId, pesquisaId);
    logger.debug('[Manual] Agregação manual concluída com sucesso');
    return { success: true, message: 'Agregação concluída' };
  } catch (error) {
    console.error('[Manual] Erro na agregação manual:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Executar job diário (para Vercel Cron)
 * Esta função é chamada pelo endpoint /api/cron/daily
 */
export async function runDailyCronJobs() {
  logger.debug('[Cron] Executando job diário via Vercel Cron...');

  try {
    const db = await getDb();
    if (!db) {
      throw new Error('Banco de dados não disponível');
    }

    // Buscar todos os projetos ativos
    const activeProjects = await db.select().from(projects).where(eq(projects.ativo, 1));

    logger.debug(`[Cron] Encontrados ${activeProjects.length} projetos ativos`);

    // Executar agregação para cada projeto
    for (const project of activeProjects) {
      logger.debug(`[Cron] Agregando métricas do projeto: ${project.nome} (ID: ${project.id})`);

      try {
        await runFullAggregation(project.id);
        logger.debug(`[Cron] ✓ Projeto ${project.nome} agregado com sucesso`);
      } catch (error) {
        console.error(`[Cron] ✗ Erro ao agregar projeto ${project.nome}:`, error);
      }
    }

    logger.debug('[Cron] Job diário concluído');
  } catch (error) {
    console.error('[Cron] Erro no job diário:', error);
    throw error;
  }
}

/**
 * Inicializar todos os cron jobs (para Railway/servidor tradicional)
 */
export function initializeCronJobs() {
  logger.debug('[Cron] Inicializando cron jobs...');

  startAnalyticsAggregationJob();

  logger.debug('[Cron] Todos os cron jobs foram inicializados');
}
