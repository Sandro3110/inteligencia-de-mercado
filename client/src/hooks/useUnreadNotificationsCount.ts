import { trpc } from "@/lib/trpc";
import { useEffect } from "react";

/**
 * Hook para obter contagem de notificações não lidas
 * Atualiza automaticamente a cada 30 segundos
 */
export function useUnreadNotificationsCount() {
  const { data: count = 0, refetch } = trpc.notifications.unreadCount.useQuery(
    undefined,
    {
      refetchInterval: 30000, // Atualiza a cada 30 segundos
      refetchOnWindowFocus: true, // Atualiza quando a janela ganha foco
    }
  );

  // Força atualização quando o componente monta
  useEffect(() => {
    refetch();
  }, [refetch]);

  return { count, refetch };
}
