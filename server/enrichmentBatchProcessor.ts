/**
 * Sistema de Processamento em Blocos de 50 Clientes
 * - Checkpoint automático a cada bloco
 * - Recuperação de erros
 * - Continuação de onde parou
 */

import { eq, and, isNull } from "drizzle-orm";
import { getDb } from "./db";
import { clientes, pesquisas } from "../drizzle/schema";
import { enrichClienteOptimized } from "./enrichmentOptimized";

interface BatchProcessorOptions {
  pesquisaId: number;
  batchSize?: number; // Padrão: 50
  onProgress?: (progress: BatchProgress) => void;
  onBatchComplete?: (batchResult: BatchResult) => void;
  onError?: (error: Error, clientId: number) => void;
}

interface BatchProgress {
  totalClientes: number;
  processados: number;
  sucessos: number;
  erros: number;
  blocoAtual: number;
  totalBlocos: number;
  percentual: number;
  tempoDecorrido: number;
  tempoEstimado: number;
}

interface BatchResult {
  blocoNumero: number;
  clientesProcessados: number;
  sucessos: number;
  erros: number;
  tempoBloco: number;
  clientesComErro: number[];
}

interface EnrichmentJob {
  pesquisaId: number;
  status: "running" | "paused" | "completed" | "error";
  totalClientes: number;
  processados: number;
  sucessos: number;
  erros: number;
  blocoAtual: number;
  startedAt: Date;
  lastCheckpoint: Date;
  clientesComErro: number[];
}

// Estado global do job (em memória)
let currentJob: EnrichmentJob | null = null;

/**
 * Inicia processamento em blocos de uma pesquisa
 */
export async function startBatchEnrichment(
  options: BatchProcessorOptions
): Promise<void> {
  const {
    pesquisaId,
    batchSize = 50,
    onProgress,
    onBatchComplete,
    onError,
  } = options;

  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Verificar se já existe job rodando
  if (currentJob && currentJob.status === "running") {
    throw new Error("Já existe um job de enriquecimento em execução");
  }

  // FASE 41.1: Buscar parâmetros da pesquisa do banco
  const pesquisaResult = await db
    .select()
    .from(pesquisas)
    .where(eq(pesquisas.id, pesquisaId))
    .limit(1);

  if (pesquisaResult.length === 0) {
    throw new Error(`Pesquisa ${pesquisaId} não encontrada`);
  }

  const pesquisa = pesquisaResult[0];
  const qtdConcorrentes = pesquisa.qtdConcorrentesPorMercado || 5;
  const qtdLeads = pesquisa.qtdLeadsPorMercado || 10;
  const qtdProdutos = pesquisa.qtdProdutosPorCliente || 3;

  console.log(
    `[BatchProcessor] 🚀 Iniciando enriquecimento em blocos de ${batchSize} clientes`
  );
  console.log(`[BatchProcessor] Pesquisa ID: ${pesquisaId}`);
  console.log(
    `[BatchProcessor] Parâmetros: ${qtdConcorrentes} concorrentes, ${qtdLeads} leads, ${qtdProdutos} produtos`
  );

  // Buscar clientes pendentes
  const clientesPendentes = await db
    .select({ id: clientes.id })
    .from(clientes)
    .where(
      and(
        eq(clientes.pesquisaId, pesquisaId),
        eq(clientes.validationStatus, "pending")
      )
    )
    .orderBy(clientes.id);

  const totalClientes = clientesPendentes.length;
  const totalBlocos = Math.ceil(totalClientes / batchSize);

  console.log(`[BatchProcessor] Total de clientes pendentes: ${totalClientes}`);
  console.log(`[BatchProcessor] Total de blocos: ${totalBlocos}`);

  if (totalClientes === 0) {
    console.log("[BatchProcessor] ✅ Nenhum cliente pendente para enriquecer");
    return;
  }

  // Inicializar job
  currentJob = {
    pesquisaId,
    status: "running",
    totalClientes,
    processados: 0,
    sucessos: 0,
    erros: 0,
    blocoAtual: 0,
    startedAt: new Date(),
    lastCheckpoint: new Date(),
    clientesComErro: [],
  };

  const startTime = Date.now();

  // Processar blocos
  for (let i = 0; i < totalBlocos; i++) {
    // Verificar se job foi pausado
    if (currentJob.status === "paused") {
      console.log("[BatchProcessor] ⏸️ Job pausado pelo usuário");
      break;
    }

    const blocoNumero = i + 1;
    const inicio = i * batchSize;
    const fim = Math.min(inicio + batchSize, totalClientes);
    const clientesBloco = clientesPendentes.slice(inicio, fim);

    console.log(`\n${"=".repeat(80)}`);
    console.log(`[BatchProcessor] 📦 BLOCO ${blocoNumero}/${totalBlocos}`);
    console.log(
      `[BatchProcessor] Clientes: ${inicio + 1} a ${fim} (${clientesBloco.length} clientes)`
    );
    console.log("=".repeat(80));

    const batchStartTime = Date.now();
    let sucessosBloco = 0;
    let errosBloco = 0;
    const clientesComErroBloco: number[] = [];

    // Processar clientes do bloco
    for (const cliente of clientesBloco) {
      try {
        console.log(`\n[BatchProcessor] Processando cliente ${cliente.id}...`);

        await enrichClienteOptimized(cliente.id, pesquisaId);

        sucessosBloco++;
        currentJob.sucessos++;
      } catch (error: any) {
        console.error(
          `[BatchProcessor] ❌ Erro ao enriquecer cliente ${cliente.id}:`,
          error.message
        );

        errosBloco++;
        currentJob.erros++;
        clientesComErroBloco.push(cliente.id);
        currentJob.clientesComErro.push(cliente.id);

        if (onError) {
          onError(error, cliente.id);
        }
      }

      currentJob.processados++;

      // Callback de progresso
      if (onProgress) {
        const tempoDecorrido = Date.now() - startTime;
        const tempoMedioPorCliente = tempoDecorrido / currentJob.processados;
        const clientesRestantes = totalClientes - currentJob.processados;
        const tempoEstimado = tempoMedioPorCliente * clientesRestantes;

        onProgress({
          totalClientes,
          processados: currentJob.processados,
          sucessos: currentJob.sucessos,
          erros: currentJob.erros,
          blocoAtual: blocoNumero,
          totalBlocos,
          percentual: Math.round(
            (currentJob.processados / totalClientes) * 100
          ),
          tempoDecorrido: Math.round(tempoDecorrido / 1000),
          tempoEstimado: Math.round(tempoEstimado / 1000),
        });
      }
    }

    const batchDuration = Date.now() - batchStartTime;

    // Resultado do bloco
    const batchResult: BatchResult = {
      blocoNumero,
      clientesProcessados: clientesBloco.length,
      sucessos: sucessosBloco,
      erros: errosBloco,
      tempoBloco: Math.round(batchDuration / 1000),
      clientesComErro: clientesComErroBloco,
    };

    console.log(`\n[BatchProcessor] ✅ Bloco ${blocoNumero} concluído:`);
    console.log(`  - Sucessos: ${sucessosBloco}`);
    console.log(`  - Erros: ${errosBloco}`);
    console.log(`  - Tempo: ${batchResult.tempoBloco}s`);

    if (clientesComErroBloco.length > 0) {
      console.log(`  - Clientes com erro: ${clientesComErroBloco.join(", ")}`);
    }

    // Callback de bloco completo
    if (onBatchComplete) {
      onBatchComplete(batchResult);
    }

    // Checkpoint automático
    currentJob.blocoAtual = blocoNumero;
    currentJob.lastCheckpoint = new Date();

    console.log(
      `[BatchProcessor] 💾 Checkpoint automático salvo (Bloco ${blocoNumero})`
    );
  }

  // Finalizar job
  const totalDuration = Date.now() - startTime;

  if (currentJob.status === "running") {
    currentJob.status = "completed";
  }

  console.log(`\n${"=".repeat(80)}`);
  console.log("[BatchProcessor] 🎉 PROCESSAMENTO CONCLUÍDO");
  console.log("=".repeat(80));
  console.log(`Total processados: ${currentJob.processados}/${totalClientes}`);
  console.log(
    `Sucessos: ${currentJob.sucessos} (${Math.round((currentJob.sucessos / totalClientes) * 100)}%)`
  );
  console.log(
    `Erros: ${currentJob.erros} (${Math.round((currentJob.erros / totalClientes) * 100)}%)`
  );
  console.log(
    `Tempo total: ${Math.round(totalDuration / 1000)}s (~${Math.round(totalDuration / 60000)} minutos)`
  );
  console.log(
    `Tempo médio por cliente: ${Math.round(totalDuration / currentJob.processados / 1000)}s`
  );

  if (currentJob.clientesComErro.length > 0) {
    console.log(
      `\n⚠️ Clientes com erro (${currentJob.clientesComErro.length}):`
    );
    console.log(currentJob.clientesComErro.join(", "));
  }
}

/**
 * Pausa o processamento atual
 */
export function pauseBatchEnrichment(): boolean {
  if (!currentJob || currentJob.status !== "running") {
    return false;
  }

  currentJob.status = "paused";
  console.log("[BatchProcessor] ⏸️ Job pausado");
  return true;
}

/**
 * Retoma o processamento pausado
 */
export async function resumeBatchEnrichment(
  options: BatchProcessorOptions
): Promise<void> {
  if (!currentJob || currentJob.status !== "paused") {
    throw new Error("Nenhum job pausado para retomar");
  }

  console.log("[BatchProcessor] ▶️ Retomando job pausado...");
  console.log(
    `  - Processados: ${currentJob.processados}/${currentJob.totalClientes}`
  );
  console.log(`  - Último bloco: ${currentJob.blocoAtual}`);

  currentJob.status = "running";

  // Continuar processamento
  await startBatchEnrichment(options);
}

/**
 * Retorna o status atual do job
 */
export function getBatchStatus(): EnrichmentJob | null {
  return currentJob;
}

/**
 * Cancela o job atual
 */
export function cancelBatchEnrichment(): boolean {
  if (!currentJob) {
    return false;
  }

  currentJob.status = "paused";
  console.log("[BatchProcessor] ❌ Job cancelado");
  return true;
}
