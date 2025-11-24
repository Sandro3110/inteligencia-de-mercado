/**
 * Sistema de Processamento em Blocos OTIMIZADO
 *
 * Melhorias implementadas:
 * - Processamento paralelo com limite de concorrência
 * - Retry automático com exponential backoff
 * - Circuit breaker para APIs externas
 * - Métricas de performance detalhadas
 */

import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import { clientes, pesquisas } from "../drizzle/schema";
import { enrichClienteOptimized } from "./enrichmentOptimized";

interface BatchProcessorOptions {
  pesquisaId: number;
  batchSize?: number; // Padrão: 50
  concurrency?: number; // Padrão: 5 (processar 5 clientes em paralelo)
  maxRetries?: number; // Padrão: 3
  onProgress?: (progress: BatchProgress) => void;
  onBatchComplete?: (batchResult: BatchResult) => void;
  onError?: (error: Error, clientId: number, willRetry: boolean) => void;
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
  taxaSucesso: number;
  velocidadeMedia: number; // clientes/segundo
}

interface BatchResult {
  blocoNumero: number;
  clientesProcessados: number;
  sucessos: number;
  erros: number;
  tempoBloco: number;
  clientesComErro: number[];
  retries: number;
  velocidadeBloco: number; // clientes/segundo
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
  totalRetries: number;
  circuitBreakerOpen: boolean;
}

interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // ms
  maxDelay: number; // ms
}

// Estado global do job (em memória)
let currentJob: EnrichmentJob | null = null;

// Circuit Breaker State
let circuitBreakerFailures = 0;
let circuitBreakerLastFailure: number | null = null;
const CIRCUIT_BREAKER_THRESHOLD = 10; // Abrir após 10 falhas consecutivas
const CIRCUIT_BREAKER_TIMEOUT = 60000; // 1 minuto

/**
 * Verifica se circuit breaker está aberto
 */
function isCircuitBreakerOpen(): boolean {
  if (circuitBreakerFailures >= CIRCUIT_BREAKER_THRESHOLD) {
    if (
      circuitBreakerLastFailure &&
      Date.now() - circuitBreakerLastFailure < CIRCUIT_BREAKER_TIMEOUT
    ) {
      return true;
    } else {
      // Reset após timeout
      circuitBreakerFailures = 0;
      circuitBreakerLastFailure = null;
      return false;
    }
  }
  return false;
}

/**
 * Registra falha no circuit breaker
 */
function recordCircuitBreakerFailure() {
  circuitBreakerFailures++;
  circuitBreakerLastFailure = Date.now();

  if (circuitBreakerFailures === CIRCUIT_BREAKER_THRESHOLD) {
    console.error(
      `[CircuitBreaker] ⚠️ Circuit breaker ABERTO após ${CIRCUIT_BREAKER_THRESHOLD} falhas consecutivas`
    );
    console.error(
      `[CircuitBreaker] Aguardando ${CIRCUIT_BREAKER_TIMEOUT / 1000}s antes de tentar novamente`
    );
  }
}

/**
 * Registra sucesso no circuit breaker
 */
function recordCircuitBreakerSuccess() {
  if (circuitBreakerFailures > 0) {
    console.log(
      `[CircuitBreaker] ✅ Sucesso após ${circuitBreakerFailures} falhas, resetando contador`
    );
  }
  circuitBreakerFailures = 0;
  circuitBreakerLastFailure = null;
}

/**
 * Aguarda um tempo com exponential backoff
 */
async function exponentialBackoff(
  attempt: number,
  config: RetryConfig
): Promise<void> {
  const delay = Math.min(
    config.baseDelay * Math.pow(2, attempt),
    config.maxDelay
  );

  console.log(
    `[Retry] Aguardando ${delay}ms antes de tentar novamente (tentativa ${attempt + 1}/${config.maxRetries})`
  );
  await new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Processa um cliente com retry automático
 */
async function processClienteWithRetry(
  clienteId: number,
  pesquisaId: number,
  retryConfig: RetryConfig,
  onError?: (error: Error, clientId: number, willRetry: boolean) => void
): Promise<{ success: boolean; retries: number }> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    // Verificar circuit breaker
    if (isCircuitBreakerOpen()) {
      console.warn(
        `[CircuitBreaker] Pulando cliente ${clienteId} - circuit breaker aberto`
      );
      throw new Error("Circuit breaker aberto - muitas falhas consecutivas");
    }

    try {
      await enrichClienteOptimized(clienteId, pesquisaId);

      // Sucesso!
      recordCircuitBreakerSuccess();
      return { success: true, retries: attempt };
    } catch (error: unknown) {
      lastError = error;
      recordCircuitBreakerFailure();

      const isLastAttempt = attempt === retryConfig.maxRetries;

      if (onError) {
        onError(error, clienteId, !isLastAttempt);
      }

      if (!isLastAttempt) {
        await exponentialBackoff(attempt, retryConfig);
      }
    }
  }

  // Todas as tentativas falharam
  console.error(
    `[Retry] ❌ Cliente ${clienteId} falhou após ${retryConfig.maxRetries + 1} tentativas`
  );
  return { success: false, retries: retryConfig.maxRetries };
}

/**
 * Processa um lote de clientes em paralelo com limite de concorrência
 */
async function processClientesBatch(
  clientes: { id: number }[],
  pesquisaId: number,
  concurrency: number,
  retryConfig: RetryConfig,
  onError?: (error: Error, clientId: number, willRetry: boolean) => void
): Promise<{
  sucessos: number;
  erros: number;
  clientesComErro: number[];
  totalRetries: number;
}> {
  const results = {
    sucessos: 0,
    erros: 0,
    clientesComErro: [] as number[],
    totalRetries: 0,
  };

  // Processar em chunks de acordo com concorrência
  for (let i = 0; i < clientes.length; i += concurrency) {
    const chunk = clientes.slice(i, Math.min(i + concurrency, clientes.length));

    // Processar chunk em paralelo
    const promises = chunk.map(cliente =>
      processClienteWithRetry(cliente.id, pesquisaId, retryConfig, onError)
    );

    const chunkResults = await Promise.allSettled(promises);

    // Contabilizar resultados
    chunkResults.forEach((result, index) => {
      const clienteId = chunk[index].id;

      if (result.status === "fulfilled") {
        if (result.value.success) {
          results.sucessos++;
        } else {
          results.erros++;
          results.clientesComErro.push(clienteId);
        }
        results.totalRetries += result.value.retries;
      } else {
        // Promise rejeitada (erro não tratado)
        results.erros++;
        results.clientesComErro.push(clienteId);
        console.error(
          `[Batch] Erro não tratado no cliente ${clienteId}:`,
          result.reason
        );
      }
    });
  }

  return results;
}

/**
 * Inicia processamento em blocos OTIMIZADO
 */
export async function startBatchEnrichmentOptimized(
  options: BatchProcessorOptions
): Promise<void> {
  const {
    pesquisaId,
    batchSize = 50,
    concurrency = 5,
    maxRetries = 3,
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

  // Buscar parâmetros da pesquisa
  const pesquisaResult = await db
    .select()
    .from(pesquisas)
    .where(eq(pesquisas.id, pesquisaId))
    .limit(1);

  if (pesquisaResult.length === 0) {
    throw new Error(`Pesquisa ${pesquisaId} não encontrada`);
  }

  const pesquisa = pesquisaResult[0];

  console.log(`[BatchProcessor] 🚀 Iniciando enriquecimento OTIMIZADO`);
  console.log(`[BatchProcessor] Pesquisa ID: ${pesquisaId}`);
  console.log(`[BatchProcessor] Configuração:`);
  console.log(`  - Tamanho do bloco: ${batchSize} clientes`);
  console.log(`  - Concorrência: ${concurrency} clientes em paralelo`);
  console.log(`  - Max retries: ${maxRetries}`);
  console.log(
    `  - Circuit breaker: ${CIRCUIT_BREAKER_THRESHOLD} falhas consecutivas`
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
    totalRetries: 0,
    circuitBreakerOpen: false,
  };

  const startTime = Date.now();
  const retryConfig: RetryConfig = {
    maxRetries,
    baseDelay: 1000, // 1 segundo
    maxDelay: 30000, // 30 segundos
  };

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
    console.log(`[BatchProcessor] Processando ${concurrency} em paralelo`);
    console.log("=".repeat(80));

    const batchStartTime = Date.now();

    // Processar bloco em paralelo com retry
    const batchResult = await processClientesBatch(
      clientesBloco,
      pesquisaId,
      concurrency,
      retryConfig,
      onError
    );

    const batchEndTime = Date.now();
    const tempoBloco = batchEndTime - batchStartTime;
    const velocidadeBloco = (
      clientesBloco.length /
      (tempoBloco / 1000)
    ).toFixed(2);

    // Atualizar job
    currentJob.processados += clientesBloco.length;
    currentJob.sucessos += batchResult.sucessos;
    currentJob.erros += batchResult.erros;
    currentJob.clientesComErro.push(...batchResult.clientesComErro);
    currentJob.totalRetries += batchResult.totalRetries;
    currentJob.blocoAtual = blocoNumero;
    currentJob.lastCheckpoint = new Date();
    currentJob.circuitBreakerOpen = isCircuitBreakerOpen();

    // Log do resultado do bloco
    console.log(
      `\n[BatchProcessor] ✅ Bloco ${blocoNumero} concluído em ${(tempoBloco / 1000).toFixed(1)}s`
    );
    console.log(
      `[BatchProcessor] Sucessos: ${batchResult.sucessos} | Erros: ${batchResult.erros} | Retries: ${batchResult.totalRetries}`
    );
    console.log(
      `[BatchProcessor] Velocidade: ${velocidadeBloco} clientes/segundo`
    );

    // Callback de bloco completo
    if (onBatchComplete) {
      onBatchComplete({
        blocoNumero,
        clientesProcessados: clientesBloco.length,
        sucessos: batchResult.sucessos,
        erros: batchResult.erros,
        tempoBloco,
        clientesComErro: batchResult.clientesComErro,
        retries: batchResult.totalRetries,
        velocidadeBloco: parseFloat(velocidadeBloco),
      });
    }

    // Callback de progresso
    if (onProgress) {
      const tempoDecorrido = Date.now() - startTime;
      const velocidadeMedia = currentJob.processados / (tempoDecorrido / 1000);
      const clientesRestantes = totalClientes - currentJob.processados;
      const tempoEstimado = clientesRestantes / velocidadeMedia;
      const taxaSucesso = (currentJob.sucessos / currentJob.processados) * 100;

      onProgress({
        totalClientes,
        processados: currentJob.processados,
        sucessos: currentJob.sucessos,
        erros: currentJob.erros,
        blocoAtual: blocoNumero,
        totalBlocos,
        percentual: Math.round((currentJob.processados / totalClientes) * 100),
        tempoDecorrido: Math.round(tempoDecorrido / 1000),
        tempoEstimado: Math.round(tempoEstimado),
        taxaSucesso: Math.round(taxaSucesso * 10) / 10,
        velocidadeMedia: Math.round(velocidadeMedia * 10) / 10,
      });
    }

    // Verificar circuit breaker
    if (isCircuitBreakerOpen()) {
      console.error(
        `[BatchProcessor] ⚠️ Pausando job - circuit breaker aberto`
      );
      currentJob.status = "paused";
      break;
    }
  }

  // Finalizar job
  const totalTime = Date.now() - startTime;
  const velocidadeGeral = (currentJob.processados / (totalTime / 1000)).toFixed(
    2
  );
  const taxaSucessoGeral = (
    (currentJob.sucessos / currentJob.processados) *
    100
  ).toFixed(1);

  console.log(`\n${"=".repeat(80)}`);
  console.log("[BatchProcessor] 🎉 PROCESSAMENTO CONCLUÍDO");
  console.log(
    `[BatchProcessor] Total processados: ${currentJob.processados}/${totalClientes}`
  );
  console.log(
    `[BatchProcessor] Sucessos: ${currentJob.sucessos} (${taxaSucessoGeral}%)`
  );
  console.log(`[BatchProcessor] Erros: ${currentJob.erros}`);
  console.log(`[BatchProcessor] Total de retries: ${currentJob.totalRetries}`);
  console.log(
    `[BatchProcessor] Tempo total: ${(totalTime / 1000).toFixed(1)}s`
  );
  console.log(
    `[BatchProcessor] Velocidade média: ${velocidadeGeral} clientes/segundo`
  );
  console.log("=".repeat(80));

  currentJob.status = "completed";
}

/**
 * Pausa o job atual
 */
export function pauseBatchEnrichment(): void {
  if (currentJob && currentJob.status === "running") {
    currentJob.status = "paused";
    console.log("[BatchProcessor] ⏸️ Job pausado");
  }
}

/**
 * Retorna status do job atual
 */
export function getBatchEnrichmentStatus(): EnrichmentJob | null {
  return currentJob;
}

/**
 * Reseta circuit breaker manualmente
 */
export function resetCircuitBreaker(): void {
  circuitBreakerFailures = 0;
  circuitBreakerLastFailure = null;
  console.log("[CircuitBreaker] ✅ Circuit breaker resetado manualmente");
}
