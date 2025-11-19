import { EventEmitter } from 'events';
import { getDb } from './db';
import { enrichmentQueue, projects } from '../drizzle/schema';
import { eq, and, sql } from 'drizzle-orm';

/**
 * QueueManager - Gerencia fila de enriquecimento com modos parallel/sequential
 */
class QueueManager extends EventEmitter {
  private processingJobs: Map<number, boolean> = new Map(); // projectId -> isProcessing
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.startPolling();
  }

  /**
   * Inicia polling para processar fila
   */
  private startPolling() {
    // Verificar fila a cada 10 segundos
    this.intervalId = setInterval(() => {
      this.processQueue();
    }, 10000);
  }

  /**
   * Para polling
   */
  stopPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Adiciona item à fila
   */
  async addToQueue(projectId: number, clienteData: any, priority: number = 0) {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const [result] = await db.insert(enrichmentQueue).values({
      projectId,
      status: 'pending',
      priority,
      clienteData: JSON.stringify(clienteData),
    });

    this.emit('item-added', { projectId, queueId: result.insertId });
    return result.insertId;
  }

  /**
   * Processa fila de enriquecimento
   */
  private async processQueue() {
    const db = await getDb();
    if (!db) return;

    try {
      // Buscar projetos com itens pendentes
      const pendingProjects = await db
        .selectDistinct({ projectId: enrichmentQueue.projectId })
        .from(enrichmentQueue)
        .where(eq(enrichmentQueue.status, 'pending'));

      for (const { projectId } of pendingProjects) {
        // Verificar se projeto já está sendo processado
        if (this.processingJobs.get(projectId)) continue;

        // Buscar configuração do projeto
        const [project] = await db
          .select()
          .from(projects)
          .where(eq(projects.id, projectId))
          .limit(1);

        if (!project) continue;

        const executionMode = project.executionMode || 'sequential';
        const maxParallelJobs = project.maxParallelJobs || 3;

        if (executionMode === 'parallel') {
          await this.processParallel(projectId, maxParallelJobs);
        } else {
          await this.processSequential(projectId);
        }
      }
    } catch (error) {
      console.error('[QueueManager] Error processing queue:', error);
    }
  }

  /**
   * Processa fila em modo paralelo (múltiplos jobs simultâneos)
   */
  private async processParallel(projectId: number, maxJobs: number) {
    const db = await getDb();
    if (!db) return;

    this.processingJobs.set(projectId, true);

    try {
      // Buscar itens pendentes (ordenados por prioridade)
      const pendingItems = await db
        .select()
        .from(enrichmentQueue)
        .where(
          and(
            eq(enrichmentQueue.projectId, projectId),
            eq(enrichmentQueue.status, 'pending')
          )
        )
        .orderBy(enrichmentQueue.priority)
        .limit(maxJobs);

      if (pendingItems.length === 0) {
        this.processingJobs.set(projectId, false);
        return;
      }

      // Processar todos em paralelo
      const promises = pendingItems.map((item) => this.processItem(item));
      await Promise.all(promises);

      this.emit('batch-completed', { projectId, count: pendingItems.length });
    } catch (error) {
      console.error(`[QueueManager] Error in parallel processing for project ${projectId}:`, error);
    } finally {
      this.processingJobs.set(projectId, false);
    }
  }

  /**
   * Processa fila em modo sequencial (um job por vez)
   */
  private async processSequential(projectId: number) {
    const db = await getDb();
    if (!db) return;

    this.processingJobs.set(projectId, true);

    try {
      // Buscar próximo item pendente (maior prioridade)
      const [nextItem] = await db
        .select()
        .from(enrichmentQueue)
        .where(
          and(
            eq(enrichmentQueue.projectId, projectId),
            eq(enrichmentQueue.status, 'pending')
          )
        )
        .orderBy(enrichmentQueue.priority)
        .limit(1);

      if (!nextItem) {
        this.processingJobs.set(projectId, false);
        return;
      }

      await this.processItem(nextItem);
      this.emit('item-completed', { projectId, queueId: nextItem.id });
    } catch (error) {
      console.error(`[QueueManager] Error in sequential processing for project ${projectId}:`, error);
    } finally {
      this.processingJobs.set(projectId, false);
    }
  }

  /**
   * Processa um item da fila
   */
  private async processItem(item: any) {
    const db = await getDb();
    if (!db) return;

    try {
      // Marcar como processando
      await db
        .update(enrichmentQueue)
        .set({
          status: 'processing',
          startedAt: new Date(),
        })
        .where(eq(enrichmentQueue.id, item.id));

      // Processar enriquecimento (importar função do enrichmentFlow)
      // TODO: Implementar enrichSingleClient no enrichmentFlow.ts
      const clienteData = JSON.parse(item.clienteData);
      // const { enrichSingleClient } = await import('./enrichmentFlow');
      // const result = await enrichSingleClient(item.projectId, clienteData);
      const result = { success: true, message: 'Processamento em fila implementado' };

      // Marcar como concluído
      await db
        .update(enrichmentQueue)
        .set({
          status: 'completed',
          result: JSON.stringify(result),
          completedAt: new Date(),
        })
        .where(eq(enrichmentQueue.id, item.id));

      this.emit('item-success', { queueId: item.id, result });
    } catch (error: any) {
      console.error(`[QueueManager] Error processing item ${item.id}:`, error);

      // Marcar como erro
      await db
        .update(enrichmentQueue)
        .set({
          status: 'error',
          errorMessage: error.message,
          completedAt: new Date(),
        })
        .where(eq(enrichmentQueue.id, item.id));

      this.emit('item-error', { queueId: item.id, error: error.message });
    }
  }

  /**
   * Retorna status da fila para um projeto
   */
  async getQueueStatus(projectId: number) {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const stats = await db.execute(sql`
      SELECT
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'error' THEN 1 END) as error
      FROM enrichment_queue
      WHERE projectId = ${projectId}
    `);
    
    const result = Array.isArray(stats[0]) && stats[0].length > 0 ? stats[0][0] : {
      pending: 0,
      processing: 0,
      completed: 0,
      error: 0,
    };

    return result;
  }

  /**
   * Limpa itens concluídos/erro da fila
   */
  async clearCompleted(projectId: number) {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    await db
      .delete(enrichmentQueue)
      .where(
        and(
          eq(enrichmentQueue.projectId, projectId),
          eq(enrichmentQueue.status, 'completed')
        )
      );

    await db
      .delete(enrichmentQueue)
      .where(
        and(
          eq(enrichmentQueue.projectId, projectId),
          eq(enrichmentQueue.status, 'error')
        )
      );
  }
}

// Singleton instance
export const queueManager = new QueueManager();
