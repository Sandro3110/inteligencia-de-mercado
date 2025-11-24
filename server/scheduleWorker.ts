/**
 * Schedule Worker - Verifica e executa agendamentos automaticamente
 * Roda a cada 1 minuto verificando agendamentos pendentes
 */

import { getDb } from "./db";
import { scheduledEnrichments } from "../drizzle/schema";
import { eq, and, lte } from "drizzle-orm";
import { executeEnrichmentFlow } from "./enrichmentFlow";
import { toPostgresTimestamp, toPostgresTimestampOrNull, now } from "./dateUtils";

let workerInterval: NodeJS.Timeout | null = null;
let isProcessing = false;

export async function startScheduleWorker() {
  if (workerInterval) {
    console.log("[ScheduleWorker] Worker já está rodando");
    return;
  }

  console.log("[ScheduleWorker] Iniciando worker de agendamentos...");

  // Executar imediatamente na primeira vez
  await checkAndExecuteSchedules();

  // Depois executar a cada 1 minuto
  workerInterval = setInterval(async () => {
    await checkAndExecuteSchedules();
  }, 60 * 1000); // 60 segundos

  console.log("[ScheduleWorker] Worker iniciado com sucesso");
}

export function stopScheduleWorker() {
  if (workerInterval) {
    clearInterval(workerInterval);
    workerInterval = null;
    console.log("[ScheduleWorker] Worker parado");
  }
}

async function checkAndExecuteSchedules() {
  if (isProcessing) {
    console.log("[ScheduleWorker] Já está processando, pulando iteração");
    return;
  }

  isProcessing = true;

  try {
    const db = await getDb();
    if (!db) {
      console.warn("[ScheduleWorker] Database não disponível");
      return;
    }

    const nowTimestamp = now();

    // Buscar agendamentos pendentes que já passaram da hora
    const pendingSchedules = await db
      .select()
      .from(scheduledEnrichments)
      .where(
        and(
          eq(scheduledEnrichments.status, "pending"),
          lte(scheduledEnrichments.scheduledAt, nowTimestamp)
        )
      )
      .limit(10);

    if (pendingSchedules.length === 0) {
      return;
    }

    console.log(
      `[ScheduleWorker] Encontrados ${pendingSchedules.length} agendamentos para executar`
    );

    for (const schedule of pendingSchedules) {
      await executeSchedule(schedule);
    }
  } catch (error) {
    console.error("[ScheduleWorker] Erro ao verificar agendamentos:", error);
  } finally {
    isProcessing = false;
  }
}

async function executeSchedule(schedule: unknown) {
  const db = await getDb();
  if (!db) return;

  try {
    console.log(
      `[ScheduleWorker] Executando agendamento #${schedule.id} do projeto #${schedule.projectId}`
    );

    // Atualizar status para 'running'
    await db
      .update(scheduledEnrichments)
      .set({
        status: "running",
        lastRunAt: new Date().toISOString().slice(0, 19).replace("T", " "),
      })
      .where(eq(scheduledEnrichments.id, schedule.id));

    // Buscar clientes do projeto para executar enriquecimento
    const { clientes: clientesTable } = await import("../drizzle/schema");
    const clientesResult = await db
      .select()
      .from(clientesTable)
      .where(eq(clientesTable.projectId, schedule.projectId))
      .limit(schedule.maxClients || 1000);

    let clientes = clientesResult;

    // Limitar ao máximo de clientes se especificado
    if (schedule.maxClients && schedule.maxClients > 0) {
      clientes = clientes.slice(0, schedule.maxClients);
    }

    if (clientes.length === 0) {
      console.warn(
        `[ScheduleWorker] Nenhum cliente encontrado para projeto #${schedule.projectId}`
      );
      await db
        .update(scheduledEnrichments)
        .set({
          status: "error",
          errorMessage: "Nenhum cliente encontrado no projeto",
        })
        .where(eq(scheduledEnrichments.id, schedule.id));
      return;
    }

    // Executar enriquecimento em background
    executeEnrichmentFlow(
      {
        clientes: clientes.map((c: unknown) => ({
          nome: c.nome,
          cnpj: c.cnpj || undefined,
          site: c.site || undefined,
          produto: c.produto || undefined,
        })),
        projectName: `Agendamento #${schedule.id}`,
      },
      async (progress: unknown) => {
        if (progress.status === "completed") {
          console.log(
            `[ScheduleWorker] Agendamento #${schedule.id} concluído com sucesso`
          );

          // Atualizar status para 'completed'
          await db
            .update(scheduledEnrichments)
            .set({ status: "completed" })
            .where(eq(scheduledEnrichments.id, schedule.id));

          // Se for recorrente, criar próximo agendamento
          if (schedule.recurrence !== "once") {
            await createNextSchedule(schedule);
          }
        } else if (progress.status === "error") {
          console.error(
            `[ScheduleWorker] Agendamento #${schedule.id} falhou:`,
            progress.message
          );

          await db
            .update(scheduledEnrichments)
            .set({
              status: "error",
              errorMessage: progress.error || "Erro desconhecido",
            })
            .where(eq(scheduledEnrichments.id, schedule.id));
        }
      }
    );

    console.log(
      `[ScheduleWorker] Enriquecimento iniciado para agendamento #${schedule.id}`
    );
  } catch (error: unknown) {
    console.error(
      `[ScheduleWorker] Erro ao executar agendamento #${schedule.id}:`,
      error
    );

    await db
      .update(scheduledEnrichments)
      .set({
        status: "error",
        errorMessage: error.message || "Erro ao executar agendamento",
      })
      .where(eq(scheduledEnrichments.id, schedule.id));
  }
}

async function createNextSchedule(schedule: unknown) {
  const db = await getDb();
  if (!db) return;

  try {
    const currentDate = new Date(schedule.scheduledAt);
    let nextDate: Date;

    if (schedule.recurrence === "daily") {
      nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 1);
    } else if (schedule.recurrence === "weekly") {
      nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 7);
    } else {
      return; // 'once' não cria próximo agendamento
    }

    // Criar novo agendamento
    await db.insert(scheduledEnrichments).values({
      projectId: schedule.projectId,
      scheduledAt: nextDate.toISOString().slice(0, 19).replace("T", " "),
      recurrence: schedule.recurrence,
      batchSize: schedule.batchSize,
      maxClients: schedule.maxClients,
      status: "pending",
    });

    console.log(
      `[ScheduleWorker] Próximo agendamento criado para ${nextDate.toISOString()}`
    );
  } catch (error) {
    console.error("[ScheduleWorker] Erro ao criar próximo agendamento:", error);
  }
}

// Iniciar worker automaticamente quando o módulo for carregado
if (process.env.NODE_ENV !== "test") {
  startScheduleWorker().catch(console.error);
}
