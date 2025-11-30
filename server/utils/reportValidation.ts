import { getDb } from '../db';
import { pesquisas, enrichmentJobs, auditLogs } from '@/drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface ReportValidationResult {
  canGenerate: boolean;
  status: 'not_enriched' | 'in_progress' | 'completed';
  warning?: string;
  enrichmentData?: {
    progress: number;
    processedClientes: number;
    totalClientes: number;
    startedAt?: string;
    completedAt?: string;
    duration?: string;
  };
}

/**
 * Valida se um relatório pode ser gerado
 */
export async function validateReportGeneration(
  pesquisaId: number
): Promise<ReportValidationResult> {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error('Falha na conexão com o banco de dados');
    }

    // 1. Buscar pesquisa
    const [pesquisa] = await db
      .select()
      .from(pesquisas)
      .where(eq(pesquisas.id, pesquisaId))
      .limit(1);

    if (!pesquisa) {
      throw new Error('Pesquisa não encontrada');
    }

    // 2. Verificar se foi enriquecida
    if (pesquisa.clientesEnriquecidos === 0) {
      return {
        canGenerate: false,
        status: 'not_enriched',
        warning:
          'Esta pesquisa ainda não foi enriquecida. Execute o enriquecimento primeiro para gerar um relatório completo.',
      };
    }

    // 3. Verificar se está em andamento
    const [activeJob] = await db
      .select()
      .from(enrichmentJobs)
      .where(and(eq(enrichmentJobs.projectId, pesquisaId), eq(enrichmentJobs.status, 'running')))
      .limit(1);

    if (activeJob) {
      const progress = Math.round((activeJob.processedClientes / activeJob.totalClientes) * 100);

      return {
        canGenerate: true,
        status: 'in_progress',
        warning: `O enriquecimento está em andamento (${progress}%). O relatório será gerado com os dados disponíveis até o momento e pode não representar o panorama completo.`,
        enrichmentData: {
          progress,
          processedClientes: activeJob.processedClientes,
          totalClientes: activeJob.totalClientes,
          startedAt: activeJob.startedAt || undefined,
        },
      };
    }

    // 4. Pesquisa concluída - buscar dados de log
    const progress = Math.round((pesquisa.clientesEnriquecidos / pesquisa.totalClientes) * 100);

    // Buscar log de conclusão
    const [completedLog] = await db
      .select()
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.resourceType, 'survey'),
          eq(auditLogs.resourceId, pesquisaId),
          eq(auditLogs.eventType, 'enrichment_completed')
        )
      )
      .orderBy(desc(auditLogs.createdAt))
      .limit(1);

    // Buscar log de início
    const [startedLog] = await db
      .select()
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.resourceType, 'survey'),
          eq(auditLogs.resourceId, pesquisaId),
          eq(auditLogs.eventType, 'enrichment_started')
        )
      )
      .orderBy(desc(auditLogs.createdAt))
      .limit(1);

    // Calcular duração
    let duration: string | undefined;
    if (startedLog && completedLog) {
      const start = new Date(startedLog.createdAt);
      const end = new Date(completedLog.createdAt);
      const diffMs = end.getTime() - start.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffSecs = Math.floor((diffMs % 60000) / 1000);
      duration = `${diffMins}m ${diffSecs}s`;
    }

    return {
      canGenerate: true,
      status: 'completed',
      enrichmentData: {
        progress,
        processedClientes: pesquisa.clientesEnriquecidos,
        totalClientes: pesquisa.totalClientes,
        startedAt: startedLog?.createdAt,
        completedAt: completedLog?.createdAt,
        duration,
      },
    };
  } catch (error) {
    console.error('[ReportValidationError]', error);
    throw error;
  }
}
