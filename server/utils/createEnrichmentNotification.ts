import { Database } from '@/server/db';
import { notifications, enrichmentJobs } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * Cria notificação de conclusão de enriquecimento
 */
export async function createEnrichmentCompletionNotification(
  db: Database,
  projectId: number,
  jobId: number
): Promise<void> {
  try {
    // Buscar job
    const [job] = await db
      .select()
      .from(enrichmentJobs)
      .where(eq(enrichmentJobs.id, jobId))
      .limit(1);

    if (!job) {
      console.warn('[Notification] Job not found:', jobId);
      return;
    }

    // Verificar se já foi notificado
    if (job.notifiedCompletion === 1) {
      console.log('[Notification] Already notified for job:', jobId);
      return;
    }

    // Verificar se está completo
    const isCompleted =
      job.status === 'completed' &&
      job.currentBatch >= job.totalBatches &&
      job.completedAt !== null;

    if (!isCompleted) {
      console.log('[Notification] Job not completed yet:', jobId);
      return;
    }

    // Calcular taxa de sucesso
    const successRate =
      job.totalClientes > 0 ? Math.round((job.successClientes / job.totalClientes) * 100) : 0;

    // Calcular duração
    const startTime = job.startedAt ? new Date(job.startedAt).getTime() : 0;
    const endTime = job.completedAt ? new Date(job.completedAt).getTime() : 0;
    const durationMs = endTime - startTime;
    const durationMinutes = Math.round(durationMs / 1000 / 60);

    // Criar notificação
    await db.insert(notifications).values({
      projectId,
      type: 'success',
      title: '✅ Enriquecimento Concluído!',
      message:
        `O enriquecimento foi finalizado com sucesso!\n\n` +
        `📊 **Estatísticas:**\n` +
        `• Total de clientes: ${job.totalClientes}\n` +
        `• Clientes enriquecidos: ${job.successClientes} (${successRate}%)\n` +
        `• Lotes processados: ${job.currentBatch}/${job.totalBatches}\n` +
        `• Tempo total: ${durationMinutes} minutos\n\n` +
        `Você já pode gerar o relatório completo!`,
      entityType: 'enrichment_job',
      entityId: jobId,
      isRead: 0,
    });

    // Marcar como notificado
    await db
      .update(enrichmentJobs)
      .set({ notifiedCompletion: 1 })
      .where(eq(enrichmentJobs.id, jobId));

    console.log('[Notification] Completion notification created for job:', jobId);
  } catch (error) {
    console.error('[Notification] Error creating completion notification:', error);
  }
}

/**
 * Verifica e cria notificações para jobs completados que ainda não foram notificados
 */
export async function checkAndNotifyCompletedJobs(db: Database): Promise<void> {
  try {
    // Buscar jobs completados que não foram notificados
    const completedJobs = await db
      .select()
      .from(enrichmentJobs)
      .where(eq(enrichmentJobs.notifiedCompletion, 0));

    for (const job of completedJobs) {
      // Verificar se está realmente completo
      const isCompleted =
        job.status === 'completed' &&
        job.currentBatch >= job.totalBatches &&
        job.completedAt !== null;

      if (isCompleted && job.projectId) {
        await createEnrichmentCompletionNotification(db, job.projectId, job.id);
      }
    }
  } catch (error) {
    console.error('[Notification] Error checking completed jobs:', error);
  }
}
