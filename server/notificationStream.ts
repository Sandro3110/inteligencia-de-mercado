/**
 * Server-Sent Events (SSE) para Notificações em Tempo Real
 *
 * Permite que o frontend receba notificações instantaneamente
 * sem precisar fazer polling constante
 */

import type { Request, Response } from "express";
import { EventEmitter } from "events";

// Event emitter global para broadcast de notificações
export const notificationEmitter = new EventEmitter();

interface SSEClient {
  id: string;
  userId: string;
  res: Response;
}

// Armazenar clientes conectados
const clients = new Map<string, SSEClient>();

/**
 * Handler para endpoint SSE de notificações
 */
export function handleNotificationStream(req: Request, res: Response) {
  // Autenticação já foi verificada pelo middleware requireAuth
  const user = req.user;
  if (!user) {
    // Fallback - não deveria acontecer se middleware estiver configurado
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const clientId = `${user.id}-${Date.now()}`;

  // Configurar headers SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Nginx compatibility

  // Enviar comentário inicial para manter conexão viva
  res.write(": connected\n\n");

  // Registrar cliente
  clients.set(clientId, { id: clientId, userId: user.id, res });

  console.log(`[SSE] Cliente conectado: ${clientId} (user: ${user.id})`);

  // Enviar evento de conexão bem-sucedida
  sendEvent(res, "connected", {
    clientId,
    timestamp: new Date().toISOString(),
  });

  // Listener para novas notificações
  const notificationListener = (notification: any) => {
    // Enviar apenas para o usuário correto
    if (notification.userId === user.id) {
      sendEvent(res, "notification", notification);
    }
  };

  notificationEmitter.on("new-notification", notificationListener);

  // Heartbeat para manter conexão viva (a cada 30s)
  const heartbeatInterval = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 30000);

  // Cleanup quando cliente desconectar
  req.on("close", () => {
    clearInterval(heartbeatInterval);
    notificationEmitter.off("new-notification", notificationListener);
    clients.delete(clientId);
    console.log(`[SSE] Cliente desconectado: ${clientId}`);
  });
}

/**
 * Enviar evento SSE formatado
 */
function sendEvent(res: Response, event: string, data: any) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

/**
 * Broadcast de nova notificação para usuário específico
 */
export function broadcastNotification(userId: string, notification: any) {
  notificationEmitter.emit("new-notification", {
    ...notification,
    userId,
  });
}

/**
 * Obter número de clientes conectados
 */
export function getConnectedClientsCount(): number {
  return clients.size;
}

/**
 * Obter clientes conectados por usuário
 */
export function getClientsByUser(userId: string): SSEClient[] {
  return Array.from(clients.values()).filter(
    client => client.userId === userId
  );
}
