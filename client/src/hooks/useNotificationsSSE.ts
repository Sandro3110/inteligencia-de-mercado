import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';

/**
 * Hook para consumir Server-Sent Events de notificações em tempo real
 * 
 * Conecta ao endpoint /api/notifications/stream e recebe notificações instantâneas
 * Reconecta automaticamente em caso de queda
 */

interface NotificationEvent {
  type: string;
  title?: string;
  message?: string;
  data?: any;
  timestamp: string;
}

interface UseNotificationsSSEOptions {
  enabled?: boolean;
  onNotification?: (notification: NotificationEvent) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export function useNotificationsSSE(options: UseNotificationsSSEOptions = {}) {
  const {
    enabled = true,
    onNotification,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const { isAuthenticated, loading } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<NotificationEvent | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const connect = () => {
    // Não conectar se já estiver conectado ou se não estiver autenticado
    if (eventSourceRef.current || !isAuthenticated || !enabled || loading) {
      return;
    }

    try {
      console.log('[SSE] Conectando ao stream de notificações...');
      const eventSource = new EventSource('/api/notifications/stream', {
        withCredentials: true,
      });

      eventSource.onopen = () => {
        console.log('[SSE] Conectado!');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        onConnect?.();
      };

      eventSource.onmessage = (event) => {
        try {
          const notification: NotificationEvent = JSON.parse(event.data);
          console.log('[SSE] Notificação recebida:', notification);
          
          setLastEvent(notification);
          onNotification?.(notification);
        } catch (error) {
          console.error('[SSE] Erro ao parsear notificação:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('[SSE] Erro na conexão:', error);
        setIsConnected(false);
        onError?.(error);

        // Fechar conexão atual
        eventSource.close();
        eventSourceRef.current = null;

        // Reconectar com backoff exponencial
        const maxAttempts = 10;
        const baseDelay = 1000; // 1 segundo
        const maxDelay = 30000; // 30 segundos

        if (reconnectAttemptsRef.current < maxAttempts) {
          const delay = Math.min(
            baseDelay * Math.pow(2, reconnectAttemptsRef.current),
            maxDelay
          );
          
          console.log(`[SSE] Reconectando em ${delay}ms (tentativa ${reconnectAttemptsRef.current + 1}/${maxAttempts})...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else {
          console.error('[SSE] Número máximo de tentativas de reconexão atingido');
        }
      };

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error('[SSE] Erro ao criar EventSource:', error);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      console.log('[SSE] Desconectando...');
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
      onDisconnect?.();
    }
  };

  // Conectar/desconectar baseado em autenticação e enabled
  useEffect(() => {
    if (isAuthenticated && enabled && !loading) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, enabled, loading]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    lastEvent,
    reconnect: () => {
      disconnect();
      reconnectAttemptsRef.current = 0;
      connect();
    },
  };
}
