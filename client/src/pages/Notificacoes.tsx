import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  BellOff,
  CheckCheck,
  Trash2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
  Target,
  AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

const notificationIcons: Record<string, React.ReactNode> = {
  lead_quality: <Target className="h-5 w-5 text-purple-500" />,
  lead_closed: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  new_competitor: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  market_threshold: <AlertCircle className="h-5 w-5 text-orange-500" />,
  data_incomplete: <XCircle className="h-5 w-5 text-red-500" />,
};

const notificationLabels: Record<string, string> = {
  lead_quality: "Qualidade de Lead",
  lead_closed: "Lead Fechado",
  new_competitor: "Novo Concorrente",
  market_threshold: "Limite de Mercado",
  data_incomplete: "Dados Incompletos",
};

export default function Notificacoes() {
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const utils = trpc.useUtils();

  const { data: notifications = [], isLoading } = trpc.notifications.list.useQuery();
  const { data: unreadCount = 0 } = trpc.notifications.unreadCount.useQuery();

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
  });

  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
      toast.success("Todas as notificações foram marcadas como lidas");
    },
  });

  const deleteMutation = trpc.notifications.delete.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
      toast.success("Notificação excluída");
    },
  });

  const filteredNotifications = showOnlyUnread
    ? notifications.filter((n: any) => !n.isRead)
    : notifications;

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Bell className="h-8 w-8" />
              Notificações
            </h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe todas as atualizações do sistema
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant={unreadCount > 0 ? "destructive" : "secondary"}>
              {unreadCount} não lidas
            </Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOnlyUnread(!showOnlyUnread)}
            >
              {showOnlyUnread ? (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  Mostrar Todas
                </>
              ) : (
                <>
                  <BellOff className="h-4 w-4 mr-2" />
                  Apenas Não Lidas
                </>
              )}
            </Button>

            {unreadCount > 0 && (
              <Button
                variant="default"
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar Todas como Lidas
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando notificações...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {showOnlyUnread
                  ? "Nenhuma notificação não lida"
                  : "Nenhuma notificação"}
              </h3>
              <p className="text-muted-foreground">
                {showOnlyUnread
                  ? "Você está em dia com todas as notificações!"
                  : "Você ainda não recebeu notificações"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification: any) => (
              <Card
                key={notification.id}
                className={`transition-all ${
                  !notification.isRead
                    ? "border-l-4 border-l-primary bg-primary/5"
                    : "border-l-4 border-l-transparent"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {notificationIcons[notification.type] || (
                          <Info className="h-5 w-5 text-blue-500" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-base">
                            {notification.title}
                          </CardTitle>
                          {!notification.isRead && (
                            <Badge variant="default" className="text-xs">
                              Nova
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {notificationLabels[notification.type] || notification.type}
                          </Badge>
                          <span>
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={markAsReadMutation.isPending}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
