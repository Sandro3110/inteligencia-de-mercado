import { getDb } from '../db';
import { notifications } from '@/drizzle/schema';

export interface NotificationData {
  userId: number;
  projectId: number;
  pesquisaId: number;
  pesquisaNome: string;
  type:
    | 'enrichment_started'
    | 'enrichment_progress'
    | 'enrichment_completed'
    | 'enrichment_paused'
    | 'enrichment_resumed'
    | 'enrichment_failed';
  data?: any;
}

/**
 * Cria uma notificação de enriquecimento
 */
export async function createEnrichmentNotification(
  notificationData: NotificationData
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.error('[NotificationError] Database connection failed');
      return;
    }

    const { userId, projectId, pesquisaId, pesquisaNome, type, data } = notificationData;

    let title = '';
    let message = '';
    let actionUrl = `/projects/${projectId}/surveys/${pesquisaId}/enrich`;

    switch (type) {
      case 'enrichment_started':
        title = 'Enriquecimento Iniciado';
        message = `O enriquecimento da pesquisa "${pesquisaNome}" foi iniciado com sucesso.`;
        break;

      case 'enrichment_progress':
        title = 'Enriquecimento em Andamento';
        message = `Pesquisa "${pesquisaNome}": ${data.progress}% concluído (${data.processedClientes}/${data.totalClientes} clientes).`;
        break;

      case 'enrichment_completed':
        title = 'Enriquecimento Concluído';
        message = `A pesquisa "${pesquisaNome}" foi enriquecida com sucesso! ${data.successClientes} clientes processados.`;
        actionUrl = `/projects/${projectId}/surveys/${pesquisaId}`;
        break;

      case 'enrichment_paused':
        title = 'Enriquecimento Pausado';
        message = `O enriquecimento da pesquisa "${pesquisaNome}" foi pausado.`;
        break;

      case 'enrichment_resumed':
        title = 'Enriquecimento Retomado';
        message = `O enriquecimento da pesquisa "${pesquisaNome}" foi retomado.`;
        break;

      case 'enrichment_failed':
        title = 'Enriquecimento Falhou';
        message = `Ocorreu um erro ao enriquecer a pesquisa "${pesquisaNome}". ${data.error || ''}`;
        break;
    }

    await db.insert(notifications).values({
      userId,
      type,
      title,
      message,
      data: JSON.stringify(data || {}),
      actionUrl,
      read: false,
      createdAt: new Date().toISOString(),
    });

    console.log(`[Notification] Created: ${type} for user ${userId}`);
  } catch (error) {
    console.error('[NotificationError]', error);
  }
}

/**
 * Notifica início de enriquecimento
 */
export async function notifyEnrichmentStarted(
  userId: number,
  projectId: number,
  pesquisaId: number,
  pesquisaNome: string,
  totalClientes: number
): Promise<void> {
  await createEnrichmentNotification({
    userId,
    projectId,
    pesquisaId,
    pesquisaNome,
    type: 'enrichment_started',
    data: { totalClientes },
  });
}

/**
 * Notifica progresso de enriquecimento
 */
export async function notifyEnrichmentProgress(
  userId: number,
  projectId: number,
  pesquisaId: number,
  pesquisaNome: string,
  processedClientes: number,
  totalClientes: number
): Promise<void> {
  const progress = Math.round((processedClientes / totalClientes) * 100);

  await createEnrichmentNotification({
    userId,
    projectId,
    pesquisaId,
    pesquisaNome,
    type: 'enrichment_progress',
    data: { processedClientes, totalClientes, progress },
  });
}

/**
 * Notifica conclusão de enriquecimento
 */
export async function notifyEnrichmentComplete(
  userId: number,
  projectId: number,
  pesquisaId: number,
  pesquisaNome: string,
  successClientes: number,
  failedClientes: number,
  results: {
    mercados: number;
    produtos: number;
    concorrentes: number;
    leads: number;
  }
): Promise<void> {
  await createEnrichmentNotification({
    userId,
    projectId,
    pesquisaId,
    pesquisaNome,
    type: 'enrichment_completed',
    data: {
      successClientes,
      failedClientes,
      taxaSucesso: Math.round((successClientes / (successClientes + failedClientes)) * 100),
      ...results,
    },
  });
}

/**
 * Notifica pausa de enriquecimento
 */
export async function notifyEnrichmentPaused(
  userId: number,
  projectId: number,
  pesquisaId: number,
  pesquisaNome: string,
  processedClientes: number,
  totalClientes: number
): Promise<void> {
  const progress = Math.round((processedClientes / totalClientes) * 100);

  await createEnrichmentNotification({
    userId,
    projectId,
    pesquisaId,
    pesquisaNome,
    type: 'enrichment_paused',
    data: { processedClientes, totalClientes, progress },
  });
}

/**
 * Notifica retomada de enriquecimento
 */
export async function notifyEnrichmentResumed(
  userId: number,
  projectId: number,
  pesquisaId: number,
  pesquisaNome: string,
  processedClientes: number,
  totalClientes: number
): Promise<void> {
  const progress = Math.round((processedClientes / totalClientes) * 100);

  await createEnrichmentNotification({
    userId,
    projectId,
    pesquisaId,
    pesquisaNome,
    type: 'enrichment_resumed',
    data: { processedClientes, totalClientes, progress },
  });
}

/**
 * Notifica falha de enriquecimento
 */
export async function notifyEnrichmentFailed(
  userId: number,
  projectId: number,
  pesquisaId: number,
  pesquisaNome: string,
  error: string
): Promise<void> {
  await createEnrichmentNotification({
    userId,
    projectId,
    pesquisaId,
    pesquisaNome,
    type: 'enrichment_failed',
    data: { error },
  });
}
