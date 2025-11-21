import type { Request, Response } from 'express';
import { notificationSSE } from './notificationSSE';
import { sdk } from './_core/sdk';

/**
 * Endpoint SSE para Notificações em Tempo Real
 * 
 * GET /api/notifications/stream
 * 
 * Requer autenticação via cookie ou header Authorization
 */
export async function handleNotificationStream(req: Request, res: Response) {
  try {
    // Autenticar usuário usando SDK do Manus
    const user = await sdk.authenticateRequest(req);

    if (!user || !user.id) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    const userId = user.id;

    // Adicionar cliente ao gerenciador SSE
    notificationSSE.addClient(userId, res);

    // Enviar mensagem de boas-vindas
    res.write(`data: ${JSON.stringify({
      type: 'welcome',
      message: 'Conectado ao stream de notificações',
      timestamp: new Date().toISOString(),
    })}\n\n`);

  } catch (error) {
    console.error('[SSE Endpoint] Erro:', error);
    res.status(500).json({ error: 'Erro ao conectar ao stream' });
  }
}

/**
 * Helper para enviar notificação via SSE
 * 
 * Uso:
 * import { sendNotificationSSE } from './notificationSSEEndpoint';
 * sendNotificationSSE(userId, { type: 'lead_high_quality', title: '...', ... });
 */
export function sendNotificationSSE(userId: string, notification: any) {
  notificationSSE.sendToUser(userId, {
    ...notification,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Helper para broadcast de notificação
 */
export function broadcastNotificationSSE(notification: any) {
  notificationSSE.broadcast({
    ...notification,
    timestamp: new Date().toISOString(),
  });
}
