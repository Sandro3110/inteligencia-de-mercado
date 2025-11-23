import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface RealtimeNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  createdAt: string;
}

/**
 * Hook para receber notificações em tempo real via SSE
 *
 * Conecta ao endpoint /api/notifications/stream e:
 * - Atualiza contador de não lidas automaticamente
 * - Mostra toast para novas notificações
 * - Reconecta automaticamente em caso de falha
 */
export function useRealtimeNotifications() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastNotification, setLastNotification] =
    useState<RealtimeNotification | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const utils = trpc.useUtils();

  useEffect(() => {
    let isMounted = true;

    function connect() {
      if (!isMounted) return;

      try {
        // Criar conexão SSE
        const eventSource = new EventSource("/api/notifications/stream");
        eventSourceRef.current = eventSource;

        // Evento: Conexão estabelecida
        eventSource.addEventListener("connected", event => {
          console.log("[SSE] Conectado ao stream de notificações");
          setIsConnected(true);
          reconnectAttemptsRef.current = 0;
        });

        // Evento: Nova notificação
        eventSource.addEventListener("notification", event => {
          try {
            const notification: RealtimeNotification = JSON.parse(event.data);
            console.log("[SSE] Nova notificação recebida:", notification);

            // Atualizar estado
            setLastNotification(notification);

            // Invalidar cache de notificações e contador
            utils.notifications.list.invalidate();
            utils.notifications.unreadCount.invalidate();

            // Mostrar toast
            toast.info(notification.title, {
              description: notification.message,
              duration: 5000,
              action: {
                label: "Ver",
                onClick: () => {
                  window.location.href = "/notificacoes";
                },
              },
            });
          } catch (error) {
            console.error("[SSE] Erro ao processar notificação:", error);
          }
        });

        // Erro de conexão
        eventSource.onerror = error => {
          console.error("[SSE] Erro na conexão:", error);
          setIsConnected(false);
          eventSource.close();

          // Tentar reconectar com backoff exponencial
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttemptsRef.current),
            30000
          );
          reconnectAttemptsRef.current++;

          console.log(
            `[SSE] Tentando reconectar em ${delay}ms (tentativa ${reconnectAttemptsRef.current})`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMounted) {
              connect();
            }
          }, delay);
        };
      } catch (error) {
        console.error("[SSE] Erro ao criar EventSource:", error);
      }
    }

    // Iniciar conexão
    connect();

    // Cleanup
    return () => {
      isMounted = false;

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [utils]);

  return {
    isConnected,
    lastNotification,
  };
}
