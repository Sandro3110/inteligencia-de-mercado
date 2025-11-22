import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, CheckCircle2, Clock, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Notification {
  id: number;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: Date;
}

export default function NotificationDashboard() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  const utils = trpc.useUtils();

  // Query para estatísticas
  const { data: stats } = trpc.notifications.getStats.useQuery(undefined, {
    enabled: !!user,
  });

  // Mutation para marcar como lida
  const markAsRead = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.getStats.invalidate();
      toast.success("Notificação marcada como lida");
    },
  });

  // Mutation para marcar todas como lidas
  const markAllAsRead = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.getStats.invalidate();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("Todas as notificações marcadas como lidas");
    },
  });

  // Conectar ao SSE
  useEffect(() => {
    if (!user) return;

    const es = new EventSource("/api/notifications/stream");

    es.addEventListener("connected", (e) => {
      const data = JSON.parse(e.data);
      console.log("[SSE] Conectado:", data);
      setIsConnected(true);
      toast.success("Conectado ao stream de notificações");
    });

    es.addEventListener("initial", (e) => {
      const data = JSON.parse(e.data);
      console.log("[SSE] Notificações iniciais:", data.notifications);
      setNotifications(data.notifications);
    });

    es.addEventListener("notification", (e) => {
      const notification = JSON.parse(e.data);
      console.log("[SSE] Nova notificação:", notification);
      setNotifications((prev) => [notification, ...prev]);
      toast.info(notification.title, {
        description: notification.message,
      });
    });

    es.addEventListener("update", (e) => {
      const updated = JSON.parse(e.data);
      console.log("[SSE] Notificação atualizada:", updated);
      setNotifications((prev) =>
        prev.map((n) => (n.id === updated.id ? updated : n))
      );
    });

    es.onerror = (error) => {
      console.error("[SSE] Erro:", error);
      setIsConnected(false);
      toast.error("Conexão perdida. Reconectando...");
    };

    setEventSource(es);

    return () => {
      es.close();
      setIsConnected(false);
    };
  }, [user]);

  const handleMarkAsRead = (id: number) => {
    markAsRead.mutate({ id });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      case "info":
      default:
        return "bg-blue-500";
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Notificações</h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real via Server-Sent Events (SSE)
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Badge variant="default" className="gap-1">
              <Bell className="h-3 w-3" />
              Conectado
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <BellOff className="h-3 w-3" />
              Desconectado
            </Badge>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Notificações no total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Não Lidas</CardTitle>
            <BellOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.unread || 0}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando leitura
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Últimas 24h</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.last24h || 0}</div>
            <p className="text-xs text-muted-foreground">
              Recebidas recentemente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllAsRead}
          disabled={!notifications.some((n) => !n.read)}
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Marcar Todas como Lidas
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            eventSource?.close();
            window.location.reload();
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reconectar
        </Button>
      </div>

      {/* Lista de Notificações */}
      <Card>
        <CardHeader>
          <CardTitle>Notificações em Tempo Real</CardTitle>
          <CardDescription>
            Stream SSE ativo - novas notificações aparecem automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma notificação ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                    notification.read
                      ? "bg-muted/30"
                      : "bg-background border-primary/50"
                  }`}
                >
                  <div
                    className={`h-2 w-2 rounded-full mt-2 ${getTypeColor(
                      notification.type
                    )}`}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold">{notification.title}</h4>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="mt-2"
                      >
                        Marcar como lida
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
