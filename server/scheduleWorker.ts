import { logger } from '@/lib/logger';

/**
 * Schedule Worker - Verifica e executa agendamentos automaticamente
 * Roda a cada 1 minuto verificando agendamentos pendentes
 */

import { getDb } from './db';
import { scheduledEnrichments } from '../drizzle/schema';
import { eq, and, lte } from 'drizzle-orm';
import { executeEnrichmentFlow } from './enrichmentFlow';
import { toPostgresTimestamp, toPostgresTimestampOrNull, now } from './dateUtils';

let workerInterval: NodeJS.Timeout | null = null;
let isProcessing = false;

export async function startScheduleWorker() {
  if (workerInterval) {
    logger.debug('[ScheduleWorker] Worker já está rodando');
    return;
  }

  logger.debug('[ScheduleWorker] Iniciando worker de agendamentos...');

  // Executar imediatamente na primeira vez
  await checkAndExecuteSchedules();

  // Depois executar a cada 1 minuto
  workerInterval = setInterval(async () => {
    await checkAndExecuteSchedules();
  }, 60 * 1000); // 60 segundos

  logger.debug('[ScheduleWorker] Worker iniciado com sucesso');
}

export function stopScheduleWorker() {
  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
    logger.debug('[ScheduleWorker] Worker parado');
  }
}

async function checkAndExecuteSchedules() {
  if (isProcessing) {
    logger.debug('[ScheduleWorker] Já está processando, pulando iteração');
    return;
  }

  isProcessing = true;

  try {
    const db = await getDb();
    if (!db) {
      console.warn('[ScheduleWorker] Database não disponível');
      return;
    }

    const nowTimestamp = now();

    // Buscar agendamentos pendentes que já passaram da hora
    const pendingSchedules = await db
      .select()
      .from(scheduledEnrichments)
      .where(
        and(
          eq(scheduledEnrichments.status, 'pending'),
          lte(scheduledEnrichments.scheduledAt, nowTimestamp)
        )
      )
      .limit(10);

    if (pendingSchedules.length === 0) {
      return;
    }

    logger.debug(
      `[ScheduleWorker] Encontrados ${pendingSchedules.length} agendamentos para executar`
    );

    for (const schedule of pendingSchedules) {
      await executeSchedule(schedule);
    }
  } catch (error) {
    console.error('[ScheduleWorker] Erro ao verificar agendamentos:', error);
  } finally {
    isProcessing = false;
  }
}

async function executeSchedule(schedule: unknown) {
  const db = await getDb();
  if (!db) return;

  try {
    logger.debug(
      // @ts-ignore - TODO: Fix TypeScript error
      `[ScheduleWorker] Executando agendamento #${schedule.id} do projeto #${schedule.projectId}`
    );

    // Atualizar status para 'running'
    await db
      .update(scheduledEnrichments)
      .set({
        status: 'running',
        lastRunAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      })
      // @ts-ignore - TODO: Fix TypeScript error
      .where(eq(scheduledEnrichments.id, schedule.id));

    // Buscar clientes do projeto para executar enriquecimento
    const { clientes: clientesTable } = await import('../drizzle/schema');
    const clientesResult = await db
      .select()
      .from(clientesTable)
      // @ts-ignore - TODO: Fix TypeScript error
      .where(eq(clientesTable.projectId, schedule.projectId))
      // @ts-ignore - TODO: Fix TypeScript error
      .limit(schedule.maxClients || 1000);

    let clientes = clientesResult;

    // Limitar ao máximo de clientes se especificado
    // @ts-ignore - TODO: Fix TypeScript error
    if (schedule.maxClients && schedule.maxClients > 0) {
      // @ts-ignore - TODO: Fix TypeScript error
      clientes = clientes.slice(0, schedule.maxClients);
    }

    if (clientes.length === 0) {
      console.warn(
        // @ts-ignore - TODO: Fix TypeScript error
        `[ScheduleWorker] Nenhum cliente encontrado para projeto #${schedule.projectId}`
      );
      await db
        .update(scheduledEnrichments)
        .set({
          status: 'error',
          errorMessage: 'Nenhum cliente encontrado no projeto',
        })
        // @ts-ignore - TODO: Fix TypeScript error
        .where(eq(scheduledEnrichments.id, schedule.id));
      return;
    }

    // Executar enriquecimento em background
    executeEnrichmentFlow(
      {
        clientes: clientes.map((c: unknown) => ({
          // @ts-ignore - TODO: Fix TypeScript error
          nome: c.nome,
          // @ts-ignore - TODO: Fix TypeScript error
          cnpj: c.cnpj || undefined,
          // @ts-ignore - TODO: Fix TypeScript error
          site: c.site || undefined,
          // @ts-ignore - TODO: Fix TypeScript error
          produto: c.produto || undefined,
        })),
        // @ts-ignore - TODO: Fix TypeScript error
        projectName: `Agendamento #${schedule.id}`,
      },
      async (progress: unknown) => {
        // @ts-ignore - TODO: Fix TypeScript error
        if (progress.status === 'completed') {
          // @ts-ignore - TODO: Fix TypeScript error
          logger.debug(`[ScheduleWorker] Agendamento #${schedule.id} concluído com sucesso`);

          // Atualizar status para 'completed'
          await db
            .update(scheduledEnrichments)
            .set({ status: 'completed' })
            // @ts-ignore - TODO: Fix TypeScript error
            .where(eq(scheduledEnrichments.id, schedule.id));

          // Se for recorrente, criar próximo agendamento
          // @ts-ignore - TODO: Fix TypeScript error
          if (schedule.recurrence !== 'once') {
            await createNextSchedule(schedule);
          }
        // @ts-ignore - TODO: Fix TypeScript error
        } else if (progress.status === 'error') {
          // @ts-ignore - TODO: Fix TypeScript error
          console.error(`[ScheduleWorker] Agendamento #${schedule.id} falhou:`, progress.message);

          await db
            .update(scheduledEnrichments)
            .set({
              status: 'error',
              // @ts-ignore - TODO: Fix TypeScript error
              errorMessage: progress.error || 'Erro desconhecido',
            })
            // @ts-ignore - TODO: Fix TypeScript error
            .where(eq(scheduledEnrichments.id, schedule.id));
        }
      }
    );

    // @ts-ignore - TODO: Fix TypeScript error
    logger.debug(`[ScheduleWorker] Enriquecimento iniciado para agendamento #${schedule.id}`);
  } catch (error: unknown) {
    // @ts-ignore - TODO: Fix TypeScript error
    console.error(`[ScheduleWorker] Erro ao executar agendamento #${schedule.id}:`, error);

    await db
      .update(scheduledEnrichments)
      .set({
        status: 'error',
        // @ts-ignore - TODO: Fix TypeScript error
        errorMessage: error.message || 'Erro ao executar agendamento',
      })
      // @ts-ignore - TODO: Fix TypeScript error
      .where(eq(scheduledEnrichments.id, schedule.id));
  }
}

async function createNextSchedule(schedule: unknown) {
  const db = await getDb();
  if (!db) return;

  try {
    // @ts-ignore - TODO: Fix TypeScript error
    const currentDate = new Date(schedule.scheduledAt);
    let nextDate: Date;

    // @ts-ignore - TODO: Fix TypeScript error
    if (schedule.recurrence === 'daily') {
      nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 1);
    // @ts-ignore - TODO: Fix TypeScript error
    } else if (schedule.recurrence === 'weekly') {
      nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 7);
    } else {
      return; // 'once' não cria próximo agendamento
    }

    // Criar novo agendamento
    await db.insert(scheduledEnrichments).values({
      // @ts-ignore - TODO: Fix TypeScript error
      projectId: schedule.projectId,
      scheduledAt: nextDate.toISOString().slice(0, 19).replace('T', ' '),
      // @ts-ignore - TODO: Fix TypeScript error
      recurrence: schedule.recurrence,
      // @ts-ignore - TODO: Fix TypeScript error
      batchSize: schedule.batchSize,
      // @ts-ignore - TODO: Fix TypeScript error
      maxClients: schedule.maxClients,
      status: 'pending',
    });

    logger.debug(`[ScheduleWorker] Próximo agendamento criado para ${nextDate.toISOString()}`);
  } catch (error) {
    console.error('[ScheduleWorker] Erro ao criar próximo agendamento:', error);
  }
}

// Iniciar worker automaticamente quando o módulo for carregado
if (process.env.NODE_ENV !== 'test') {
  startScheduleWorker().catch(console.error);
}
