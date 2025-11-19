/**
 * Script de controle do enriquecimento
 * Monitora o estado de pausa/retomada e controla o processo
 */

import { getDb } from "./server/db";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";

const execAsync = promisify(exec);
const PROJECT_ID = 1;
const ENRICHMENT_SCRIPT = "enrich-800-clientes.ts";
const CHECK_INTERVAL = 5000; // 5 segundos

interface EnrichmentRun {
  id: number;
  projectId: number;
  status: "running" | "paused" | "completed" | "error";
  processedClients: number;
  totalClients: number;
}

let currentProcess: any = null;
let monitorInterval: NodeJS.Timeout | null = null;

/**
 * Busca execução ativa no banco
 */
async function getActiveRun(): Promise<EnrichmentRun | null> {
  const db = await getDb();
  if (!db) return null;

  const { enrichmentRuns } = await import("./drizzle/schema");
  const { eq, and, sql } = await import("drizzle-orm");

  const result = await db
    .select()
    .from(enrichmentRuns)
    .where(
      and(
        eq(enrichmentRuns.projectId, PROJECT_ID),
        sql`${enrichmentRuns.status} IN ('running', 'paused')`
      )
    )
    .orderBy(sql`${enrichmentRuns.startedAt} DESC`)
    .limit(1);

  return result.length > 0 ? (result[0] as any) : null;
}

/**
 * Atualiza progresso da execução
 */
async function updateRunProgress(runId: number, processedClients: number) {
  const db = await getDb();
  if (!db) return;

  const { enrichmentRuns } = await import("./drizzle/schema");
  const { eq } = await import("drizzle-orm");

  await db
    .update(enrichmentRuns)
    .set({ processedClients })
    .where(eq(enrichmentRuns.id, runId));
}

/**
 * Verifica se o processo está rodando
 */
async function isProcessRunning(): Promise<boolean> {
  try {
    const { stdout } = await execAsync(
      `ps aux | grep "${ENRICHMENT_SCRIPT}" | grep -v grep | wc -l`
    );
    return parseInt(stdout.trim()) > 0;
  } catch {
    return false;
  }
}

/**
 * Inicia o processo de enriquecimento
 */
async function startEnrichment() {
  if (currentProcess) {
    console.log("⚠️  Processo já está rodando");
    return;
  }

  console.log("🚀 Iniciando enriquecimento...");

  const { spawn } = await import("child_process");
  currentProcess = spawn("pnpm", ["tsx", ENRICHMENT_SCRIPT], {
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
  });

  currentProcess.stdout?.on("data", (data: Buffer) => {
    console.log(`[ENRICH] ${data.toString()}`);
  });

  currentProcess.stderr?.on("data", (data: Buffer) => {
    console.error(`[ENRICH ERROR] ${data.toString()}`);
  });

  currentProcess.on("exit", (code: number) => {
    console.log(`✅ Processo finalizado com código ${code}`);
    currentProcess = null;
  });

  currentProcess.unref();
}

/**
 * Para o processo de enriquecimento
 */
async function stopEnrichment() {
  if (!currentProcess) {
    console.log("⚠️  Nenhum processo rodando");
    return;
  }

  console.log("⏸️  Pausando enriquecimento...");

  try {
    // Mata o processo e todos os filhos
    process.kill(-currentProcess.pid, "SIGTERM");
    currentProcess = null;
    console.log("✅ Processo pausado");
  } catch (error) {
    console.error("❌ Erro ao pausar:", error);
  }
}

/**
 * Monitora o estado e controla o processo
 */
async function monitorAndControl() {
  const run = await getActiveRun();

  if (!run) {
    console.log("ℹ️  Nenhuma execução ativa");
    return;
  }

  const isRunning = await isProcessRunning();

  console.log(`📊 Status: ${run.status} | Processo: ${isRunning ? "Rodando" : "Parado"}`);

  // Se deve estar rodando mas não está
  if (run.status === "running" && !isRunning) {
    console.log("🔄 Retomando enriquecimento...");
    await startEnrichment();
  }

  // Se deve estar pausado mas está rodando
  if (run.status === "paused" && isRunning) {
    console.log("⏸️  Pausando enriquecimento...");
    await stopEnrichment();
  }

  // Atualizar progresso no banco
  try {
    const progressData = fs.readFileSync("/tmp/progresso-enriquecimento.json", "utf-8");
    const progress = JSON.parse(progressData);
    const processedClients = progress.reduce((acc: number, p: any) => acc + (p.concluido ? 50 : 0), 0);
    
    if (processedClients !== run.processedClients) {
      await updateRunProgress(run.id, processedClients);
      console.log(`📈 Progresso atualizado: ${processedClients}/${run.totalClients}`);
    }
  } catch (error) {
    // Arquivo de progresso ainda não existe
  }
}

/**
 * Inicia o monitor
 */
async function startMonitor() {
  console.log("🎯 Iniciando monitor de controle do enriquecimento");
  console.log(`⏱️  Verificando a cada ${CHECK_INTERVAL / 1000}s\n`);

  // Primeira verificação imediata
  await monitorAndControl();

  // Verificações periódicas
  monitorInterval = setInterval(async () => {
    await monitorAndControl();
  }, CHECK_INTERVAL);
}

/**
 * Para o monitor
 */
function stopMonitor() {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
  }
  if (currentProcess) {
    stopEnrichment();
  }
}

// Tratamento de sinais
process.on("SIGINT", () => {
  console.log("\n🛑 Parando monitor...");
  stopMonitor();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Parando monitor...");
  stopMonitor();
  process.exit(0);
});

// Iniciar monitor
startMonitor();
