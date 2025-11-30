'use client';

/**
 * useNotifications - Hook Simplificado
 * Usa apenas tRPC query, sem Zustand duplicado
 */

import { trpc } from '@/lib/trpc/client';

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  entityType?: string | null;
  entityId?: number | null;
}

/**
 * Hook para buscar notificações não lidas
 */
export function useNotifications(projectId?: number) {
  // Query de notificações não lidas com refetch automático
  const {
    data: notifications = [],
    isLoading,
    refetch,
  } = trpc.notifications.getUnread.useQuery(
    { projectId, limit: 50 },
    {
      refetchInterval: 30000, // Refetch a cada 30 segundos
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    }
  );

  // Mutation para marcar como lida
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Mutation para marcar todas como lidas
  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Mutation para deletar
  const deleteMutation = trpc.notifications.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  return {
    notifications,
    isLoading,
    unreadCount: notifications.length,
    markAsRead: (id: string) => markAsReadMutation.mutate({ id }),
    markAllAsRead: () => markAllAsReadMutation.mutate({ projectId }),
    deleteNotification: (id: string) => deleteMutation.mutate({ id }),
    refetch,
  };
}

/**
 * Hook para contar notificações não lidas
 */
export function useUnreadCount(projectId?: number) {
  const { data: notifications = [] } = trpc.notifications.getUnread.useQuery(
    { projectId, limit: 50 },
    {
      refetchInterval: 30000,
      refetchOnWindowFocus: true,
    }
  );

  return notifications.length;
}
