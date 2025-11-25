import { logger } from '@/lib/logger';

// @ts-ignore - TODO: Fix TypeScript error
import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
type User = { id: string; name: string; email: string };

export interface NotificationPayload {
  id: string;
  type: 'enrichment_complete' | 'new_lead' | 'quality_alert' | 'system' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  data?: Record<string, any>;
  userId?: string;
  read?: boolean;
}

export class WebSocketManager {
  private io: SocketIOServer;
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NODE_ENV === 'production' ? false : '*',
        credentials: true,
      },
      path: '/socket.io/',
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // @ts-ignore - TODO: Fix TypeScript error
    this.io.on('connection', (socket) => {
      logger.debug('[WebSocket] Cliente conectado:', socket.id);

      // Autenticação do usuário
      socket.on('authenticate', (user: User) => {
        if (!user?.id) {
          console.warn('[WebSocket] Tentativa de autenticação sem usuário');
          return;
        }

        // Adicionar socket ao mapa de usuários
        if (!this.userSockets.has(user.id)) {
          this.userSockets.set(user.id, new Set());
        }
        this.userSockets.get(user.id)!.add(socket.id);

        socket.data.userId = user.id;
        socket.join(`user:${user.id}`);

        logger.debug(`[WebSocket] Usuário ${user.name} (${user.id}) autenticado`);

        // Confirmar autenticação
        socket.emit('authenticated', { success: true, userId: user.id });
      });

      // Marcar notificação como lida
      socket.on('mark_read', (notificationId: string) => {
        logger.debug(`[WebSocket] Notificação ${notificationId} marcada como lida`);
        // Aqui você pode salvar no banco se quiser persistir
      });

      // Desconexão
      socket.on('disconnect', () => {
        const userId = socket.data.userId;
        if (userId && this.userSockets.has(userId)) {
          this.userSockets.get(userId)!.delete(socket.id);
          if (this.userSockets.get(userId)!.size === 0) {
            this.userSockets.delete(userId);
          }
        }
        logger.debug('[WebSocket] Cliente desconectado:', socket.id);
      });
    });
  }

  /**
   * Envia notificação para um usuário específico
   */
  sendToUser(userId: string, notification: NotificationPayload) {
    this.io.to(`user:${userId}`).emit('notification', notification);
    // @ts-ignore - TODO: Fix TypeScript error
    logger.debug(`[WebSocket] Notificação enviada para usuário ${userId}:`, notification.type);
  }

  /**
   * Envia notificação para todos os usuários conectados
   */
  broadcast(notification: NotificationPayload) {
    this.io.emit('notification', notification);
    // @ts-ignore - TODO: Fix TypeScript error
    logger.debug('[WebSocket] Broadcast enviado:', notification.type);
  }

  /**
   * Envia notificação de progresso de enriquecimento
   */
  sendEnrichmentProgress(
    userId: string,
    data: {
      pesquisaId: number;
      totalItems: number;
      processedItems: number;
      currentStep: string;
      percentage: number;
    }
  ) {
    this.io.to(`user:${userId}`).emit('enrichment_progress', data);
  }

  /**
   * Envia notificação de conclusão de enriquecimento
   */
  sendEnrichmentComplete(
    userId: string,
    data: {
      pesquisaId: number;
      pesquisaNome: string;
      totalProcessed: number;
      duration: number;
    }
  ) {
    const notification: NotificationPayload = {
      id: `enrichment-${data.pesquisaId}-${Date.now()}`,
      type: 'enrichment_complete',
      title: '✅ Enriquecimento Concluído',
      message: `Pesquisa "${data.pesquisaNome}" processada com sucesso! ${data.totalProcessed} itens enriquecidos.`,
      timestamp: new Date(),
      data,
      userId,
      read: false,
    };

    this.sendToUser(userId, notification);
  }

  /**
   * Envia notificação de novo lead de alta qualidade
   */
  sendNewHighQualityLead(
    userId: string,
    data: {
      leadId: number;
      leadNome: string;
      qualityScore: number;
      mercado: string;
    }
  ) {
    const notification: NotificationPayload = {
      id: `lead-${data.leadId}-${Date.now()}`,
      type: 'new_lead',
      title: '🎯 Novo Lead de Alta Qualidade',
      message: `Lead "${data.leadNome}" identificado no mercado ${data.mercado} (Score: ${data.qualityScore})`,
      timestamp: new Date(),
      data,
      userId,
      read: false,
    };

    this.sendToUser(userId, notification);
  }

  /**
   * Envia alerta de qualidade
   */
  sendQualityAlert(
    userId: string,
    data: {
      type: 'low_quality' | 'missing_data' | 'duplicate';
      itemType: 'cliente' | 'concorrente' | 'lead';
      itemId: number;
      itemNome: string;
      message: string;
    }
  ) {
    const notification: NotificationPayload = {
      id: `alert-${data.itemId}-${Date.now()}`,
      type: 'quality_alert',
      title: '⚠️ Alerta de Qualidade',
      message: data.message,
      timestamp: new Date(),
      data,
      userId,
      read: false,
    };

    this.sendToUser(userId, notification);
  }

  /**
   * Retorna número de usuários conectados
   */
  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  /**
   * Verifica se um usuário está conectado
   */
  isUserConnected(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }
}

// Singleton instance
let wsManager: WebSocketManager | null = null;

export function initializeWebSocket(httpServer: HTTPServer): WebSocketManager {
  if (!wsManager) {
    wsManager = new WebSocketManager(httpServer);
    logger.debug('[WebSocket] Servidor WebSocket inicializado');
  }
  return wsManager;
}

export function getWebSocketManager(): WebSocketManager | null {
  return wsManager;
}
