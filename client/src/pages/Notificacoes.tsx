import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  TrendingUp,
  FileText,
  Download,
  PlayCircle,
  PauseCircle,
  FolderPlus,
  Archive,
  ArchiveRestore,
  Target,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import {
  NotificationFilters,
  type NotificationType,
  type NotificationStatus,
} from "@/components/NotificationFilters";

const notificationIcons: Record<string, React.ReactNode> = {
  enrichment_complete: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  enrichment_started: <PlayCircle className="h-5 w-5 text-blue-500" />,
  enrichment_error: <XCircle className="h-5 w-5 text-red-500" />,
  lead_high_quality: <Target className="h-5 w-5 text-purple-500" />,
  quality_alert: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  circuit_breaker: <Zap className="h-5 w-5 text-orange-500" />,
  project_created: <FolderPlus className="h-5 w-5 text-blue-500" />,
  project_hibernated: <Archive className="h-5 w-5 text-gray-500" />,
  project_reactivated: <ArchiveRestore className="h-5 w-5 text-green-500" />,
  pesquisa_created: <FileText className="h-5 w-5 text-blue-500" />,
  validation_batch_complete: <CheckCheck className="h-5 w-5 text-green-500" />,
  export_complete: <Download className="h-5 w-5 text-blue-500" />,
  report_generated: <FileText className="h-5 w-5 text-purple-500" />,
  system: <Info className="h-5 w-5 text-gray-500" />,
};

export default function Notificacoes() {
  const [filterType, setFilterType] = useState<NotificationType>("all");
  const [filterStatus, setFilterStatus] = useState<NotificationStatus>("all");
  const [page, setPage] = useState(0);
  const limit = 20;

  const utils = trpc.useUtils();

  // Query de notificações
  const { data: notifications = [], isLoading } = trpc.notifications.list.useQuery({
    type: filterType === "all" ? undefined : filterType,
    isRead: filterStatus === "all" ? undefined : filterStatus === "read",
    limit,
    offset: page * limit,
  });

  // Query de contador de não lidas
  const { data: unreadData } = trpc.notifications.countUnread.useQuery({});

  // Mutations
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.countUnread.invalidate();
    },
  });

  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      toast.success("Todas as notificações foram marcadas como lidas");
      utils.notifications.list.invalidate();
      utils.notifications.countUnread.invalidate();
    },
  });

  const deleteMutation = trpc.notifications.delete.useMutation({
    onSuccess: () => {
      toast.success("Notificação removida");
      utils.notifications.list.invalidate();
      utils.notifications.countUnread.invalidate();
    },
  });

  const deleteAllReadMutation = trpc.notifications.deleteAllRead.useMutation({
    onSuccess: () => {
      toast.success("Todas as notificações lidas foram removidas");
      utils.notifications.list.invalidate();
      utils.notifications.countUnread.invalidate();
    },
  });

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate({ id });
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate({});
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id });
  };

  const handleDeleteAllRead = () => {
    deleteAllReadMutation.mutate({});
  };

  const handleClearFilters = () => {
    setFilterType("all");
    setFilterStatus("all");
    setPage(0);
  };

  const hasActiveFilters = filterType !== "all" || filterStatus !== "all";

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Bell className="h-8 w-8" />
              Notificações
            </h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe todas as atualizações e alertas do sistema
            </p>
          </div>

          <div className="flex items-center gap-2">
            {unreadData && unreadData.count > 0 && (
              <Badge variant="destructive" className="text-sm px-3 py-1">
                {unreadData.count} não {unreadData.count === 1 ? "lida" : "lidas"}
              </Badge>
            )}
          </div>
        </div>

        {/* Filtros */}
        <NotificationFilters
          type={filterType}
          status={filterStatus}
          onTypeChange={setFilterType}
          onStatusChange={setFilterStatus}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Ações em lote */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {notifications.length} {notifications.length === 1 ? "notificação" : "notificações"}
          </div>

          <div className="flex items-center gap-2">
            {unreadData && unreadData.count > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar todas como lidas
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteAllRead}
              disabled={deleteAllReadMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar lidas
            </Button>
          </div>
        </div>

        {/* Lista de notificações */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Carregando notificações...
            </div>
          ) : notifications.length === 0 ? (
            <Card className="p-12 text-center">
              <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                Nenhuma notificação encontrada
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {hasActiveFilters
                  ? "Tente ajustar os filtros para ver mais resultados"
                  : "Você está em dia! Não há notificações no momento"}
              </p>
            </Card>
          ) : (
            notifications.map((notification: any) => (
              <Card
                key={notification.id}
                className={`p-4 transition-all hover:shadow-md ${
                  notification.isRead === 0 ? "bg-blue-50/50 border-blue-200" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Ícone */}
                  <div className="flex-shrink-0 mt-1">
                    {notificationIcons[notification.type] || (
                      <Bell className="h-5 w-5 text-gray-500" />
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base">{notification.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>

                        {/* Metadata */}
                        {notification.metadata && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {notification.metadata.score && (
                              <Badge variant="secondary" className="text-xs">
                                Score: {notification.metadata.score}
                              </Badge>
                            )}
                            {notification.metadata.mercadoNome && (
                              <Badge variant="outline" className="text-xs">
                                {notification.metadata.mercadoNome}
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="mt-2 text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {notification.isRead === 0 && (
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
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Paginação */}
        {notifications.length === limit && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Anterior
            </Button>
            <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
              Próxima
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
