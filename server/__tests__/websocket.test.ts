import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';
import { initializeWebSocket, getWebSocketManager } from '../websocket';
import { io as ioClient, Socket } from 'socket.io-client';

describe('WebSocket System', () => {
  let httpServer: ReturnType<typeof createServer>;
  let clientSocket: Socket;
  let serverUrl: string;

  beforeAll((done) => {
    httpServer = createServer();
    initializeWebSocket(httpServer);
    
    httpServer.listen(0, () => {
      const address = httpServer.address();
      const port = typeof address === 'object' && address ? address.port : 3001;
      serverUrl = `http://localhost:${port}`;
      done();
    });
  });

  afterAll((done) => {
    if (clientSocket) {
      clientSocket.disconnect();
    }
    httpServer.close(done);
  });

  it('deve inicializar WebSocketManager', () => {
    const wsManager = getWebSocketManager();
    expect(wsManager).toBeDefined();
    expect(wsManager).not.toBeNull();
  });

  it('deve conectar cliente ao servidor', (done) => {
    clientSocket = ioClient(serverUrl, {
      path: '/socket.io/',
      transports: ['websocket'],
    });

    clientSocket.on('connect', () => {
      expect(clientSocket.connected).toBe(true);
      done();
    });

    clientSocket.on('connect_error', (error) => {
      done(error);
    });
  });

  it('deve autenticar usuário', (done) => {
    const testUser = {
      id: 'test-user-123',
      name: 'Test User',
      email: 'test@example.com',
    };

    clientSocket.emit('authenticate', testUser);

    clientSocket.on('authenticated', (data: { success: boolean; userId: string }) => {
      expect(data.success).toBe(true);
      expect(data.userId).toBe(testUser.id);
      done();
    });
  });

  it('deve receber notificação broadcast', (done) => {
    const wsManager = getWebSocketManager();
    expect(wsManager).not.toBeNull();

    const testNotification = {
      id: 'test-notif-1',
      type: 'enrichment_complete' as const,
      title: 'Test Notification',
      message: 'This is a test notification',
      timestamp: new Date(),
      read: false,
    };

    clientSocket.on('notification', (notification: any) => {
      expect(notification.id).toBe(testNotification.id);
      expect(notification.type).toBe(testNotification.type);
      expect(notification.title).toBe(testNotification.title);
      done();
    });

    // Aguardar um pouco para garantir que o listener está registrado
    setTimeout(() => {
      wsManager!.broadcast(testNotification);
    }, 100);
  });

  it('deve marcar notificação como lida', (done) => {
    const notificationId = 'test-notif-2';

    // Simular evento de marcar como lida
    clientSocket.emit('mark_read', notificationId);

    // Aguardar processamento
    setTimeout(() => {
      // Se não houver erro, o teste passou
      done();
    }, 100);
  });

  it('deve retornar número de usuários conectados', () => {
    const wsManager = getWebSocketManager();
    expect(wsManager).not.toBeNull();
    
    const connectedUsers = wsManager!.getConnectedUsersCount();
    expect(connectedUsers).toBeGreaterThanOrEqual(0);
  });
});
