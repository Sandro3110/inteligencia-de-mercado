/**
 * Gerenciador de Jobs de Enriquecimento com Pausa/Retomar
 */

import { getDb } from './db';
import { enrichmentJobs } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { enrichClienteOptimized } from './enrichmentOptimized';
import { clientes } from '../drizzle/schema';
import { notifyOwner } from './_core/notification';

export interface JobProgress {
  jobId: number;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  totalClientes: number;
  processedClientes: number;
  successClientes: number;
  failedClientes: number;
  currentBatch: number;
  totalBatches: number;
  estimatedTimeRemaining: number;
  percentComplete: number;
}

// Controle global de jobs em execução
const runningJobs = new Map<number, { shouldPause: boolean }>();

/**
 * Cria um novo job de enriquecimento
 */
export async function createEnrichmentJob(
  projectId: number,
  options: {
    batchSize?: number;
    checkpointInterval?: number;
  } = {}
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Contar clientes do projeto
  const allClientes = await db.select().from(clientes).where(eq(clientes.projectId, projectId));
  const totalClientes = allClientes.length;

  if (totalClientes === 0) {
    throw new Error('Nenhum cliente encontrado para enriquecer');
  }

  const batchSize = options.batchSize || 5;
  const totalBatches = Math.ceil(totalClientes / batchSize);

  // Criar job
  const [result] = await db.insert(enrichmentJobs).values({
    projectId,
    status: 'pending',
    totalClientes,
    processedClientes: 0,
    successClientes: 0,
    failedClientes: 0,
    currentBatch: 0,
    totalBatches,
    batchSize: batchSize,
    checkpointInterval: options.checkpointInterval || 50,
  });

  return result.insertId;
}

/**
 * Inicia ou retoma um job de enriquecimento
 */
export async function startEnrichmentJob(jobId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Buscar job
  const [job] = await db.select().from(enrichmentJobs).where(eq(enrichmentJobs.id, jobId)).limit(1);
  
  if (!job) {
    throw new Error(`Job ${jobId} não encontrado`);
  }

  if (job.status === 'running') {
    throw new Error(`Job ${jobId} já está em execução`);
  }

  if (job.status === 'completed') {
    throw new Error(`Job ${jobId} já foi concluído`);
  }

  // Marcar como running
  await db.update(enrichmentJobs)
    .set({ 
      status: 'running',
      startedAt: job.startedAt || new Date(),
      pausedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(enrichmentJobs.id, jobId));

  // Registrar job em execução
  runningJobs.set(jobId, { shouldPause: false });

  // Executar job em background
  processJob(jobId).catch(async (error) => {
    console.error(`[Job ${jobId}] Erro fatal:`, error);
    await db.update(enrichmentJobs)
      .set({ 
        status: 'failed',
        errorMessage: error.message,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(enrichmentJobs.id, jobId));
    
    runningJobs.delete(jobId);
  });
}

/**
 * Pausa um job em execução
 */
export async function pauseEnrichmentJob(jobId: number): Promise<void> {
  const jobControl = runningJobs.get(jobId);
  
  if (!jobControl) {
    throw new Error(`Job ${jobId} não está em execução`);
  }

  // Sinalizar para pausar
  jobControl.shouldPause = true;
  
  console.log(`[Job ${jobId}] Solicitação de pausa recebida`);
}

/**
 * Cancela um job
 */
export async function cancelEnrichmentJob(jobId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Pausar se estiver rodando
  if (runningJobs.has(jobId)) {
    await pauseEnrichmentJob(jobId);
  }

  // Marcar como failed
  await db.update(enrichmentJobs)
    .set({ 
      status: 'failed',
      errorMessage: 'Cancelado pelo usuário',
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(enrichmentJobs.id, jobId));
}

/**
 * Busca status de um job
 */
export async function getJobProgress(jobId: number): Promise<JobProgress | null> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const [job] = await db.select().from(enrichmentJobs).where(eq(enrichmentJobs.id, jobId)).limit(1);
  
  if (!job) return null;

  return {
    jobId: job.id,
    status: job.status,
    totalClientes: job.totalClientes,
    processedClientes: job.processedClientes,
    successClientes: job.successClientes,
    failedClientes: job.failedClientes,
    currentBatch: job.currentBatch,
    totalBatches: job.totalBatches,
    estimatedTimeRemaining: job.estimatedTimeRemaining || 0,
    percentComplete: Math.round((job.processedClientes / job.totalClientes) * 100),
  };
}

/**
 * Lista todos os jobs de um projeto
 */
export async function listProjectJobs(projectId: number): Promise<JobProgress[]> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const jobs = await db.select()
    .from(enrichmentJobs)
    .where(eq(enrichmentJobs.projectId, projectId))
    .orderBy(enrichmentJobs.createdAt);

  return jobs.map(job => ({
    jobId: job.id,
    status: job.status,
    totalClientes: job.totalClientes,
    processedClientes: job.processedClientes,
    successClientes: job.successClientes,
    failedClientes: job.failedClientes,
    currentBatch: job.currentBatch,
    totalBatches: job.totalBatches,
    estimatedTimeRemaining: job.estimatedTimeRemaining || 0,
    percentComplete: Math.round((job.processedClientes / job.totalClientes) * 100),
  }));
}

/**
 * Processa um job (função interna)
 */
async function processJob(jobId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const [job] = await db.select().from(enrichmentJobs).where(eq(enrichmentJobs.id, jobId)).limit(1);
  
  if (!job) {
    throw new Error(`Job ${jobId} não encontrado`);
  }

  const jobControl = runningJobs.get(jobId);
  if (!jobControl) {
    throw new Error(`Job ${jobId} não está registrado`);
  }

  console.log(`[Job ${jobId}] Iniciando processamento`);
  console.log(`[Job ${jobId}] Total: ${job.totalClientes} clientes, Processados: ${job.processedClientes}`);

  // Buscar clientes do projeto
  const allClientes = await db.select().from(clientes).where(eq(clientes.projectId, job.projectId));

  // Se está retomando, pular clientes já processados
  const startIndex = job.processedClientes;
  const clientesToProcess = allClientes.slice(startIndex);

  console.log(`[Job ${jobId}] Retomando do cliente ${startIndex + 1}`);

  const startTime = Date.now();

  // Processar em lotes
  for (let i = 0; i < clientesToProcess.length; i += job.batchSize) {
    // Verificar se deve pausar
    if (jobControl.shouldPause) {
      console.log(`[Job ${jobId}] Pausando...`);
      
      await db.update(enrichmentJobs)
        .set({ 
          status: 'paused',
          pausedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(enrichmentJobs.id, jobId));
      
      runningJobs.delete(jobId);
      
      await notifyOwner({
        title: `⏸️ Enriquecimento Pausado - Job ${jobId}`,
        content: `Progresso: ${job.processedClientes}/${job.totalClientes} clientes (${Math.round(job.processedClientes / job.totalClientes * 100)}%)`,
      });
      
      return;
    }

    const batch = clientesToProcess.slice(i, Math.min(i + job.batchSize, clientesToProcess.length));
    const currentBatch = Math.floor((startIndex + i) / job.batchSize) + 1;

    console.log(`[Job ${jobId}] Processando lote ${currentBatch}/${job.totalBatches} (${batch.length} clientes)`);

    // Processar clientes em paralelo
    const batchPromises = batch.map(async (cliente) => {
      try {
        const result = await enrichClienteOptimized(cliente.id, job.projectId);
        return { success: result.success, clienteId: cliente.id };
      } catch (error: any) {
        console.error(`[Job ${jobId}] Erro ao processar cliente ${cliente.id}:`, error.message);
        return { success: false, clienteId: cliente.id };
      }
    });

    const batchResults = await Promise.all(batchPromises);

    // Atualizar progresso
    const batchSuccess = batchResults.filter(r => r.success).length;
    const batchFailed = batchResults.filter(r => !r.success).length;

    const newProcessed = job.processedClientes + batchResults.length;
    const newSuccess = job.successClientes + batchSuccess;
    const newFailed = job.failedClientes + batchFailed;

    // Calcular tempo estimado restante
    const elapsed = Date.now() - startTime;
    const avgTimePerCliente = elapsed / (newProcessed - job.processedClientes);
    const remaining = job.totalClientes - newProcessed;
    const estimatedTimeRemaining = Math.round(avgTimePerCliente * remaining);

    // Atualizar job
    await db.update(enrichmentJobs)
      .set({
        processedClientes: newProcessed,
        successClientes: newSuccess,
        failedClientes: newFailed,
        currentBatch,
        lastClienteId: batch[batch.length - 1].id,
        estimatedTimeRemaining,
        updatedAt: new Date(),
      })
      .where(eq(enrichmentJobs.id, jobId));

    console.log(`[Job ${jobId}] Progresso: ${newProcessed}/${job.totalClientes} (${Math.round(newProcessed / job.totalClientes * 100)}%)`);

    // Checkpoint automático
    if (newProcessed % job.checkpointInterval === 0 || newProcessed === job.totalClientes) {
      console.log(`[Job ${jobId}] Checkpoint automático em ${newProcessed} clientes`);
      
      await notifyOwner({
        title: `📊 Checkpoint - Job ${jobId}`,
        content: `Progresso: ${newProcessed}/${job.totalClientes} (${Math.round(newProcessed / job.totalClientes * 100)}%)\nSucesso: ${newSuccess}\nFalhas: ${newFailed}\nTempo restante: ~${Math.round(estimatedTimeRemaining / 1000 / 60)} min`,
      });
    }
  }

  // Job concluído
  const totalDuration = Date.now() - startTime;

  await db.update(enrichmentJobs)
    .set({ 
      status: 'completed',
      completedAt: new Date(),
      estimatedTimeRemaining: 0,
      updatedAt: new Date(),
    })
    .where(eq(enrichmentJobs.id, jobId));

  runningJobs.delete(jobId);

  console.log(`[Job ${jobId}] Concluído em ${Math.round(totalDuration / 1000 / 60)} minutos`);

  await notifyOwner({
    title: `✅ Enriquecimento Concluído - Job ${jobId}`,
    content: `Total: ${job.totalClientes} clientes em ${Math.round(totalDuration / 1000 / 60)} minutos\nSucesso: ${job.successClientes} (${Math.round(job.successClientes / job.totalClientes * 100)}%)\nFalhas: ${job.failedClientes}`,
  });
}
