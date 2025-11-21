import { EventEmitter } from 'events';
import type { Response } from 'express';

/**
 * Gerenciador de Server-Sent Events para Notificações em Tempo Real
 * 
 * Permite enviar notificações instantâneas para todos os clientes conectados
 * via SSE sem necessidade de polling.
 */

interface SSEClient {
  userId: string;
  res: Response;
  lastPing: number;
}

class NotificationSSEManager extends EventEmitter {
  private clients: Map<string, SSEClient[]> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.startHeartbeat();
  }

  /**
   * Adiciona um novo cliente SSE
   */
  addClient(userId: string, res: Response) {
    // Configurar headers SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Nginx
    });

    // Enviar mensagem inicial de conexão
    res.write('data: {"type":"connected"}\n\n');

    // Adicionar cliente à lista
    const client: SSEClient = {
      userId,
      res,
      lastPing: Date.now(),
    };

    if (!this.clients.has(userId)) {
      this.clients.set(userId, []);
    }
    this.clients.get(userId)!.push(client);

    console.log(`[SSE] Cliente conectado: ${userId} (total: ${this.getTotalClients()})`);

    // Cleanup ao desconectar
    res.on('close', () => {
      this.removeClient(userId, res);
    });
  }

  /**
   * Remove um cliente SSE
   */
  private removeClient(userId: string, res: Response) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      const index = userClients.findIndex((c) => c.res === res);
      if (index !== -1) {
        userClients.splice(index, 1);
      }
      if (userClients.length === 0) {
        this.clients.delete(userId);
      }
    }
    console.log(`[SSE] Cliente desconectado: ${userId} (total: ${this.getTotalClients()})`);
  }

  /**
   * Envia notificação para um usuário específico
   */
  sendToUser(userId: string, notification: any) {
    const userClients = this.clients.get(userId);
    if (!userClients || userClients.length === 0) {
      console.log(`[SSE] Nenhum cliente conectado para usuário ${userId}`);
      return;
    }

    const data = JSON.stringify(notification);
    userClients.forEach((client) => {
      try {
        client.res.write(`data: ${data}\n\n`);
      } catch (error) {
        console.error(`[SSE] Erro ao enviar para ${userId}:`, error);
        this.removeClient(userId, client.res);
      }
    });

    console.log(`[SSE] Notificação enviada para ${userId}:`, notification.type);
  }

  /**
   * Envia notificação para todos os usuários conectados (broadcast)
   */
  broadcast(notification: any) {
    const data = JSON.stringify(notification);
    let sent = 0;

    this.clients.forEach((userClients, userId) => {
      userClients.forEach((client) => {
        try {
          client.res.write(`data: ${data}\n\n`);
          sent++;
        } catch (error) {
          console.error(`[SSE] Erro ao enviar broadcast para ${userId}:`, error);
          this.removeClient(userId, client.res);
        }
      });
    });

    console.log(`[SSE] Broadcast enviado para ${sent} clientes:`, notification.type);
  }

  /**
   * Envia heartbeat (ping) para manter conexões vivas
   */
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      this.clients.forEach((userClients, userId) => {
        userClients.forEach((client) => {
          try {
            // Enviar comentário (ignorado pelo cliente, mas mantém conexão)
            client.res.write(': heartbeat\n\n');
            client.lastPing = now;
          } catch (error) {
            console.error(`[SSE] Erro no heartbeat para ${userId}:`, error);
            this.removeClient(userId, client.res);
          }
        });
      });
    }, 30000); // A cada 30 segundos
  }

  /**
   * Para o heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Retorna número total de clientes conectados
   */
  getTotalClients(): number {
    let total = 0;
    this.clients.forEach((userClients) => {
      total += userClients.length;
    });
    return total;
  }

  /**
   * Retorna lista de usuários conectados
   */
  getConnectedUsers(): string[] {
    return Array.from(this.clients.keys());
  }

  /**
   * Desconecta todos os clientes (cleanup)
   */
  disconnectAll() {
    this.clients.forEach((userClients, userId) => {
      userClients.forEach((client) => {
        try {
          client.res.end();
        } catch (error) {
          console.error(`[SSE] Erro ao desconectar ${userId}:`, error);
        }
      });
    });
    this.clients.clear();
    this.stopHeartbeat();
    console.log('[SSE] Todos os clientes desconectados');
  }
}

// Singleton
export const notificationSSE = new NotificationSSEManager();
