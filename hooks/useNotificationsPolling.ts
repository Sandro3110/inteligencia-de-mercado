'use client';

import { useEffect } from 'react';
import { trpc } from '@/lib/trpc/client';
import { useNotifications } from './useNotifications';
import { useUnreadNotificationsCount } from './useUnreadNotificationsCount';

interface UseNotificationsPollingOptions {
  userId?: string;
  pollingInterval?: number; // ms
  enabled?: boolean;
}

/**
 * Hook useNotificationsPolling
 *
 * Faz polling de notificações via tRPC e popula o Zustand store
 * Deve ser usado uma vez no layout/provider principal
 */
export function useNotificationsPolling(options: UseNotificationsPollingOptions = {}) {
  const {
    userId,
    pollingInterval = 30000, // 30 segundos
    enabled = true,
  } = options;

  const setConnected = useNotifications((state) => state.setConnected);
  const setCount = useUnreadNotificationsCount((state) => state.setCount);

  // Query para buscar notificações não lidas
  const { data: unreadNotifications } = trpc.notifications.getUnread.useQuery(
    { userId, limit: 20 },
    {
      enabled: enabled && !!userId,
      refetchInterval: pollingInterval,
      refetchOnWindowFocus: true,
      onSuccess: () => {
        // Marcar como conectado quando receber dados
        setConnected(true);
      },
      onError: () => {
        // Marcar como desconectado em caso de erro
        setConnected(false);
      },
    }
  );

  // Atualizar contador quando notificações mudarem
  useEffect(() => {
    if (unreadNotifications) {
      setCount(unreadNotifications.length);

      // TODO: Adicionar notificações ao Zustand store se necessário
      // Por enquanto, apenas atualiza o contador
    }
  }, [unreadNotifications, setCount]);

  // Marcar como conectado no início
  useEffect(() => {
    if (enabled && userId) {
      setConnected(true);
    }
  }, [enabled, userId, setConnected]);

  return {
    unreadCount: unreadNotifications?.length || 0,
    isPolling: enabled && !!userId,
  };
}
