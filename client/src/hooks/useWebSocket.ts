import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/_core/hooks/useAuth';

export interface Notification {
  id: string;
  type: 'enrichment_complete' | 'new_lead' | 'quality_alert' | 'system' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  data?: Record<string, any>;
  userId?: string;
  read: boolean;
}

export interface EnrichmentProgress {
  pesquisaId: number;
  totalItems: number;
  processedItems: number;
  currentStep: string;
  percentage: number;
}

export function useWebSocket() {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [enrichmentProgress, setEnrichmentProgress] = useState<EnrichmentProgress | null>(null);

  // Conectar ao WebSocket
  useEffect(() => {
    if (!user?.id) return;

    const socket = io({
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[WebSocket] Conectado');
      setIsConnected(true);
      
      // Autenticar usuário
      socket.emit('authenticate', user);
    });

    socket.on('authenticated', (data: { success: boolean; userId: string }) => {
      console.log('[WebSocket] Autenticado:', data);
    });

    socket.on('disconnect', () => {
      console.log('[WebSocket] Desconectado');
      setIsConnected(false);
    });

    socket.on('notification', (notification: Notification) => {
      console.log('[WebSocket] Nova notificação:', notification);
      
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Tocar som (opcional)
      playNotificationSound();

      // Mostrar notificação do navegador (se permitido)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo.svg',
        });
      }
    });

    socket.on('enrichment_progress', (progress: EnrichmentProgress) => {
      console.log('[WebSocket] Progresso de enriquecimento:', progress);
      setEnrichmentProgress(progress);
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id]);

  // Solicitar permissão para notificações do navegador
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    if (socketRef.current) {
      socketRef.current.emit('mark_read', notificationId);
    }
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    notifications.forEach((n) => {
      if (socketRef.current && !n.read) {
        socketRef.current.emit('mark_read', n.id);
      }
    });
  }, [notifications]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    isConnected,
    notifications,
    unreadCount,
    enrichmentProgress,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
}

// Helper para tocar som de notificação
function playNotificationSound() {
  try {
    const audio = new Audio('/notification.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {
      // Ignorar erro se o navegador bloquear autoplay
    });
  } catch (error) {
    // Ignorar erro
  }
}
