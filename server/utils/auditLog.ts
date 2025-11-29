/**
 * Sistema de Auditoria e Log
 * Registra eventos importantes do ciclo de vida de projetos e pesquisas
 */

import { getDb } from '../db';
import { auditLogs } from '../../drizzle/schema';

interface CreateAuditLogParams {
  resourceType: 'project' | 'survey';
  resourceId: number;
  resourceName?: string;
  eventType: string;
  eventData?: any;
  duration?: number;
  clientesProcessados?: number;
  clientesSucesso?: number;
  clientesFalha?: number;
  userId?: number;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Cria um registro de auditoria no banco de dados
 */
export async function createAuditLog(params: CreateAuditLogParams): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.error('[AuditLog] Database connection failed');
      return;
    }

    await db.insert(auditLogs).values({
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      resourceName: params.resourceName,
      eventType: params.eventType,
      eventData: params.eventData,
      duration: params.duration,
      clientesProcessados: params.clientesProcessados,
      clientesSucesso: params.clientesSucesso,
      clientesFalha: params.clientesFalha,
      userId: params.userId,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    console.log(
      `[AuditLog] ✅ ${params.eventType} registrado para ${params.resourceType} ${params.resourceId}`
    );
  } catch (error) {
    console.error('[AuditLog] ❌ Erro ao criar log:', error);
    // Não propagar erro para não interromper o fluxo principal
  }
}

/**
 * Helper específico para log de início de enriquecimento
 */
export async function logEnrichmentStarted(params: {
  pesquisaId: number;
  pesquisaNome: string;
  totalClientes: number;
  userId?: number;
}): Promise<void> {
  await createAuditLog({
    resourceType: 'survey',
    resourceId: params.pesquisaId,
    resourceName: params.pesquisaNome,
    eventType: 'enrichment_started',
    eventData: { totalClientes: params.totalClientes },
    userId: params.userId,
  });
}

/**
 * Helper específico para log de conclusão de enriquecimento
 */
export async function logEnrichmentCompleted(params: {
  pesquisaId: number;
  pesquisaNome: string;
  duration: number;
  clientesProcessados: number;
  clientesSucesso: number;
  clientesFalha: number;
  metricas: {
    concorrentes: number;
    leads: number;
    produtos: number;
    mercados: number;
  };
  userId?: number;
}): Promise<void> {
  await createAuditLog({
    resourceType: 'survey',
    resourceId: params.pesquisaId,
    resourceName: params.pesquisaNome,
    eventType: 'enrichment_completed',
    eventData: params.metricas,
    duration: params.duration,
    clientesProcessados: params.clientesProcessados,
    clientesSucesso: params.clientesSucesso,
    clientesFalha: params.clientesFalha,
    userId: params.userId,
  });
}

/**
 * Helper específico para log de falha de enriquecimento
 */
export async function logEnrichmentFailed(params: {
  pesquisaId: number;
  pesquisaNome: string;
  error: string;
  clientesProcessados: number;
  userId?: number;
}): Promise<void> {
  await createAuditLog({
    resourceType: 'survey',
    resourceId: params.pesquisaId,
    resourceName: params.pesquisaNome,
    eventType: 'enrichment_failed',
    eventData: { error: params.error },
    clientesProcessados: params.clientesProcessados,
    userId: params.userId,
  });
}

/**
 * Helper específico para log de criação de pesquisa
 */
export async function logSurveyCreated(params: {
  pesquisaId: number;
  pesquisaNome: string;
  projectId: number;
  totalClientes: number;
  userId?: number;
}): Promise<void> {
  await createAuditLog({
    resourceType: 'survey',
    resourceId: params.pesquisaId,
    resourceName: params.pesquisaNome,
    eventType: 'created',
    eventData: { projectId: params.projectId, totalClientes: params.totalClientes },
    userId: params.userId,
  });
}

/**
 * Helper específico para log de criação de projeto
 */
export async function logProjectCreated(params: {
  projectId: number;
  projectName: string;
  userId?: number;
}): Promise<void> {
  await createAuditLog({
    resourceType: 'project',
    resourceId: params.projectId,
    resourceName: params.projectName,
    eventType: 'created',
    userId: params.userId,
  });
}
