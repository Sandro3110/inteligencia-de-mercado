import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

/**
 * Hook para refresh global de dados
 * Fase 75: Opção 2 - Híbrida
 * Fase 76: + Ctrl+R + Auto-refresh inteligente
 * 
 * Permite forçar atualização de todas as queries tRPC ativas
 * Útil para botão "Atualizar Dados" no sidebar
 */
export function useGlobalRefresh(options?: {
  enableAutoRefresh?: boolean;
  autoRefreshInterval?: number; // em milissegundos (padrão: 5min)
  enableKeyboardShortcut?: boolean;
}) {
  const {
    enableAutoRefresh = false,
    autoRefreshInterval = 5 * 60 * 1000, // 5 minutos
    enableKeyboardShortcut = true,
  } = options || {};

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(() => {
    // Recupera preferência do localStorage
    const saved = localStorage.getItem("gestor-pav:auto-refresh");
    return saved ? JSON.parse(saved) : enableAutoRefresh;
  });
  const utils = trpc.useUtils();

  /**
   * Força refresh de todas as queries tRPC
   * Invalida cache e recarrega dados
   */
  const refreshAll = useCallback(async (silent = false) => {
    if (isRefreshing) return; // Previne cliques múltiplos

    setIsRefreshing(true);
    
    try {
      // Invalida TODAS as queries do tRPC
      await utils.invalidate();
      
      // Atualiza timestamp
      setLastRefreshTime(new Date());
      
      // Feedback visual (apenas se não for silencioso)
      if (!silent) {
        toast.success("Dados atualizados com sucesso!", {
          description: "Todas as informações foram recarregadas.",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
      if (!silent) {
        toast.error("Erro ao atualizar dados", {
          description: "Tente novamente em alguns instantes.",
          duration: 4000,
        });
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [utils]);

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

  /**
   * Alterna auto-refresh e salva preferência
   */
  const toggleAutoRefresh = useCallback(() => {
    setAutoRefreshEnabled((prev) => {
      const newValue = !prev;
      localStorage.setItem("gestor-pav:auto-refresh", JSON.stringify(newValue));
      toast.info(
        newValue ? "Auto-refresh ativado" : "Auto-refresh desativado",
        {
          description: newValue
            ? `Dados serão atualizados a cada ${autoRefreshInterval / 60000} minutos`
            : "Atualizações automáticas pausadas",
          duration: 3000,
        }
      );
      return newValue;
    });
  }, [autoRefreshInterval]);

  /**
   * Verifica se dados estão desatualizados (>10min)
   */
  const isDataStale = (): boolean => {
    if (!lastRefreshTime) return false;
    const now = new Date();
    const diffMs = now.getTime() - lastRefreshTime.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    return diffMinutes > 10;
  };

  // Auto-refresh inteligente (apenas quando aba está visível)
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const handleVisibilityChange = () => {
      // Se aba ficou visível e dados estão desatualizados, atualiza
      if (document.visibilityState === "visible" && isDataStale()) {
        refreshAll(true); // silent refresh
      }
    };

    // Interval para auto-refresh
    const intervalId = setInterval(() => {
      // Só atualiza se aba estiver visível
      if (document.visibilityState === "visible") {
        refreshAll(true); // silent refresh
      }
    }, autoRefreshInterval);

    // Listener para mudança de visibilidade
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [autoRefreshEnabled, autoRefreshInterval, refreshAll]);

  // Atalho de teclado Ctrl+R
  useEffect(() => {
    if (!enableKeyboardShortcut) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+R ou Cmd+R (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === "r") {
        e.preventDefault(); // Previne reload da página
        refreshAll(false); // refresh com feedback visual
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enableKeyboardShortcut, refreshAll]);

  return {
    refreshAll,
    isRefreshing,
    lastRefreshTime,
    timeSinceRefresh: getTimeSinceRefresh(),
    autoRefreshEnabled,
    toggleAutoRefresh,
    isDataStale: isDataStale(),
  };
}
