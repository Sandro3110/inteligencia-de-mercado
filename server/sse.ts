import { Request, Response } from "express";
import { getDb } from "./db";
import { notifications } from "../drizzle/schema";
import { desc, eq } from "drizzle-orm";

interface SSEClient {
  id: string;
  userId: string;
  res: Response;
}

const clients: SSEClient[] = [];

/**
 * Adiciona um cliente SSE
 */
export function addSSEClient(userId: string, res: Response): string {
  const clientId = `${userId}-${Date.now()}`;
  clients.push({ id: clientId, userId, res });

  // Remove cliente quando a conexão fechar
  res.on("close", () => {
    removeSSEClient(clientId);
  });

  return clientId;
}

/**
 * Remove um cliente SSE
 */
function removeSSEClient(clientId: string) {
  const index = clients.findIndex((c) => c.id === clientId);
  if (index !== -1) {
    clients.splice(index, 1);
  }
}

/**
 * Envia evento SSE para um usuário específico
 */
export function sendSSEToUser(userId: string, event: string, data: any) {
  const userClients = clients.filter((c) => c.userId === userId);
  userClients.forEach((client) => {
    client.res.write(`event: ${event}\n`);
    client.res.write(`data: ${JSON.stringify(data)}\n\n`);
  });
}

/**
 * Envia evento SSE para todos os clientes
 */
export function broadcastSSE(event: string, data: any) {
  clients.forEach((client) => {
    client.res.write(`event: ${event}\n`);
    client.res.write(`data: ${JSON.stringify(data)}\n\n`);
  });
}

/**
 * Handler do endpoint SSE
 */
export async function handleSSEConnection(req: Request, res: Response) {
  // Configurar headers SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Obter userId do contexto de autenticação
  const userId = (req as any).user?.id;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  // Adicionar cliente
  const clientId = addSSEClient(userId, res);

  // Enviar evento de conexão
  res.write(`event: connected\n`);
  res.write(`data: ${JSON.stringify({ clientId, timestamp: new Date() })}\n\n`);

  // Enviar notificações iniciais
  try {
    const db = await getDb();
    if (db) {
      const userNotifications = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt))
        .limit(10);

      res.write(`event: initial\n`);
      res.write(`data: ${JSON.stringify({ notifications: userNotifications })}\n\n`);
    }
  } catch (error) {
    console.error("[SSE] Error fetching initial notifications:", error);
  }

  // Manter conexão viva com heartbeat
  const heartbeat = setInterval(() => {
    res.write(`:heartbeat ${Date.now()}\n\n`);
  }, 30000); // 30 segundos

  // Limpar ao fechar conexão
  res.on("close", () => {
    clearInterval(heartbeat);
    removeSSEClient(clientId);
  });
}
