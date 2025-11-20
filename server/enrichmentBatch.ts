/**
 * Sistema de enriquecimento em lote com processamento paralelo
 */

// import { enrichClienteOptimized } from './enrichmentOptimized'; // OBSOLETO
import { getDb } from './db';
import { clientes } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { notifyOwner } from './_core/notification';

export interface BatchProgress {
  total: number;
  processed: number;
  success: number;
  failed: number;
  startTime: number;
  lastUpdate: number;
  estimatedTimeRemaining: number;
  currentBatch: number;
  totalBatches: number;
}

export interface BatchResult {
  clienteId: number;
  nome: string;
  success: boolean;
  mercados: number;
  produtos: number;
  concorrentes: number;
  leads: number;
  duration: number;
  error?: string;
}

/**
 * Processa clientes em lote com paralelização
 */
export async function enrichClientesBatch(
  projectId: number,
  options: {
    batchSize?: number; // Quantos clientes processar em paralelo (padrão: 5)
    checkpointInterval?: number; // Salvar progresso a cada N clientes (padrão: 50)
    onProgress?: (progress: BatchProgress) => void;
    onCheckpoint?: (progress: BatchProgress, results: BatchResult[]) => void;
  } = {}
): Promise<{
  success: boolean;
  results: BatchResult[];
  progress: BatchProgress;
}> {
  const batchSize = options.batchSize || 5;
  const checkpointInterval = options.checkpointInterval || 50;
  
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }
  
  // Buscar todos os clientes do projeto
  const allClientes = await db.select().from(clientes).where(eq(clientes.projectId, projectId));
  
  if (allClientes.length === 0) {
    throw new Error('Nenhum cliente encontrado para enriquecer');
  }
  
  const totalClientes = allClientes.length;
  const totalBatches = Math.ceil(totalClientes / batchSize);
  
  const progress: BatchProgress = {
    total: totalClientes,
    processed: 0,
    success: 0,
    failed: 0,
    startTime: Date.now(),
    lastUpdate: Date.now(),
    estimatedTimeRemaining: 0,
    currentBatch: 0,
    totalBatches,
  };
  
  const results: BatchResult[] = [];
  
  console.log(`[Batch] Iniciando enriquecimento de ${totalClientes} clientes`);
  console.log(`[Batch] Configuração: ${batchSize} clientes em paralelo, checkpoint a cada ${checkpointInterval}`);
  
  // Processar em lotes
  for (let i = 0; i < totalClientes; i += batchSize) {
    const batch = allClientes.slice(i, Math.min(i + batchSize, totalClientes));
    progress.currentBatch = Math.floor(i / batchSize) + 1;
    
    console.log(`[Batch] Processando lote ${progress.currentBatch}/${totalBatches} (${batch.length} clientes)`);
    
    // Processar clientes em paralelo
    const batchPromises = batch.map(async (cliente) => {
      const startTime = Date.now();
      
      try {
        const result = await enrichClienteOptimized(cliente.id, projectId);
        const duration = Date.now() - startTime;
        
        return {
          clienteId: cliente.id,
          nome: cliente.nome,
          success: result.success,
          mercados: result.mercados,
          produtos: result.produtos,
          concorrentes: result.concorrentes,
          leads: result.leads,
          duration,
        };
      } catch (error: any) {
        const duration = Date.now() - startTime;
        
        return {
          clienteId: cliente.id,
          nome: cliente.nome,
          success: false,
          mercados: 0,
          produtos: 0,
          concorrentes: 0,
          leads: 0,
          duration,
          error: error.message,
        };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Atualizar progresso
    progress.processed += batchResults.length;
    progress.success += batchResults.filter(r => r.success).length;
    progress.failed += batchResults.filter(r => !r.success).length;
    progress.lastUpdate = Date.now();
    
    // Calcular tempo estimado restante
    const elapsed = progress.lastUpdate - progress.startTime;
    const avgTimePerCliente = elapsed / progress.processed;
    const remaining = totalClientes - progress.processed;
    progress.estimatedTimeRemaining = Math.round(avgTimePerCliente * remaining);
    
    // Callback de progresso
    if (options.onProgress) {
      options.onProgress(progress);
    }
    
    console.log(`[Batch] Progresso: ${progress.processed}/${totalClientes} (${Math.round(progress.processed / totalClientes * 100)}%)`);
    console.log(`[Batch] Sucesso: ${progress.success}, Falhas: ${progress.failed}`);
    console.log(`[Batch] Tempo estimado restante: ${Math.round(progress.estimatedTimeRemaining / 1000 / 60)} minutos`);
    
    // Checkpoint automático
    if (progress.processed % checkpointInterval === 0 || progress.processed === totalClientes) {
      console.log(`[Batch] Checkpoint automático em ${progress.processed} clientes`);
      
      if (options.onCheckpoint) {
        options.onCheckpoint(progress, results);
      }
      
      // Notificar proprietário
      await notifyOwner({
        title: `Enriquecimento: ${progress.processed}/${totalClientes} clientes`,
        content: `Progresso: ${Math.round(progress.processed / totalClientes * 100)}%\nSucesso: ${progress.success}\nFalhas: ${progress.failed}\nTempo restante: ~${Math.round(progress.estimatedTimeRemaining / 1000 / 60)} min`,
      });
    }
  }
  
  const totalDuration = Date.now() - progress.startTime;
  const avgDuration = totalDuration / totalClientes;
  
  console.log(`[Batch] Enriquecimento concluído!`);
  console.log(`[Batch] Total: ${totalClientes} clientes em ${Math.round(totalDuration / 1000 / 60)} minutos`);
  console.log(`[Batch] Média: ${Math.round(avgDuration / 1000)}s por cliente`);
  console.log(`[Batch] Sucesso: ${progress.success} (${Math.round(progress.success / totalClientes * 100)}%)`);
  console.log(`[Batch] Falhas: ${progress.failed} (${Math.round(progress.failed / totalClientes * 100)}%)`);
  
  // Notificação final
  await notifyOwner({
    title: `✅ Enriquecimento Concluído - ${totalClientes} clientes`,
    content: `Tempo total: ${Math.round(totalDuration / 1000 / 60)} minutos\nSucesso: ${progress.success} (${Math.round(progress.success / totalClientes * 100)}%)\nFalhas: ${progress.failed}\n\nMercados: ${results.reduce((sum, r) => sum + r.mercados, 0)}\nProdutos: ${results.reduce((sum, r) => sum + r.produtos, 0)}\nConcorrentes: ${results.reduce((sum, r) => sum + r.concorrentes, 0)}\nLeads: ${results.reduce((sum, r) => sum + r.leads, 0)}`,
  });
  
  return {
    success: progress.failed === 0,
    results,
    progress,
  };
}

/**
 * Estima tempo e custo para enriquecer N clientes
 */
export function estimateBatchCost(numClientes: number): {
  estimatedTime: string;
  estimatedCost: string;
  tokensEstimated: number;
} {
  const tokensPerCliente = 10000; // ~10k tokens por cliente
  const secondsPerCliente = 35; // ~35s por cliente
  const costPerMillionTokens = 0.15; // Gemini 1.5 Flash
  
  const tokensEstimated = numClientes * tokensPerCliente;
  const costEstimated = (tokensEstimated / 1000000) * costPerMillionTokens;
  const timeEstimated = numClientes * secondsPerCliente;
  
  const hours = Math.floor(timeEstimated / 3600);
  const minutes = Math.floor((timeEstimated % 3600) / 60);
  
  return {
    estimatedTime: hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`,
    estimatedCost: `$${costEstimated.toFixed(2)} USD`,
    tokensEstimated,
  };
}
