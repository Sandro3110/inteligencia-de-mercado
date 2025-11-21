import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

/**
 * Hook para refresh global de dados
 * Fase 75: Opção 2 - Híbrida
 * 
 * Permite forçar atualização de todas as queries tRPC ativas
 * Útil para botão "Atualizar Dados" no sidebar
 */
export function useGlobalRefresh() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const utils = trpc.useUtils();

  /**
   * Força refresh de todas as queries tRPC
   * Invalida cache e recarrega dados
   */
  const refreshAll = async () => {
    if (isRefreshing) return; // Previne cliques múltiplos

    setIsRefreshing(true);
    
    try {
      // Invalida TODAS as queries do tRPC
      await utils.invalidate();
      
      // Atualiza timestamp
      setLastRefreshTime(new Date());
      
      // Feedback visual
      toast.success("Dados atualizados com sucesso!", {
        description: "Todas as informações foram recarregadas.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
      toast.error("Erro ao atualizar dados", {
        description: "Tente novamente em alguns instantes.",
        duration: 4000,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  /**
   * Retorna tempo desde última atualização em formato legível
   */
  const getTimeSinceRefresh = (): string | null => {
    if (!lastRefreshTime) return null;

    const now = new Date();
    const diffMs = now.getTime() - lastRefreshTime.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes === 0) return "agora mesmo";
    if (diffMinutes === 1) return "há 1 minuto";
    if (diffMinutes < 60) return `há ${diffMinutes} minutos`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours === 1) return "há 1 hora";
    return `há ${diffHours} horas`;
  };

  return {
    refreshAll,
    isRefreshing,
    lastRefreshTime,
    timeSinceRefresh: getTimeSinceRefresh(),
  };
}
