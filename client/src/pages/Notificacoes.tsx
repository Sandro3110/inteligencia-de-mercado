import { useState, useEffect, useMemo } from "react";
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
import {
  NotificationFilters,
  NotificationFiltersState,
} from "@/components/NotificationFilters";

const notificationIcons: Record<string, React.ReactNode> = {
  lead_quality: <Target className="h-5 w-5 text-purple-500" />,
  lead_closed: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  new_competitor: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  market_threshold: <AlertCircle className="h-5 w-5 text-orange-500" />,
  data_incomplete: <XCircle className="h-5 w-5 text-red-500" />,
  enrichment: <Target className="h-5 w-5 text-blue-500" />,
  validation: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  export: <AlertCircle className="h-5 w-5 text-purple-500" />,
};

const notificationLabels: Record<string, string> = {
  lead_quality: "Qualidade de Lead",
  lead_closed: "Lead Fechado",
  new_competitor: "Novo Concorrente",
  market_threshold: "Limite de Mercado",
  data_incomplete: "Dados Incompletos",
  enrichment: "Enriquecimento",
  validation: "Validação",
  export: "Exportação",
};

const FILTERS_STORAGE_KEY = "notification-filters";

export default function Notificacoes() {
  const utils = trpc.useUtils();

  // Load filters from localStorage
  const [filters, setFilters] = useState<NotificationFiltersState>(() => {
    const stored = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { status: "all", type: "all", period: "all" };
      }
    }
    return { status: "all", type: "all", period: "all" };
  });

  // Save filters to localStorage
  useEffect(() => {
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  const { data: notifications = [], isLoading } = trpc.notifications.list.useQuery();
  const { data: unreadCount = 0 } = trpc.notifications.unreadCount.useQuery();
  const { data: projects = [] } = trpc.projects.list.useQuery();

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

  // Apply filters
  const filteredNotifications = useMemo(() => {
    let result = [...notifications];

    // Filter by status
    if (filters.status === "read") {
      result = result.filter((n: any) => n.isRead);
    } else if (filters.status === "unread") {
      result = result.filter((n: any) => !n.isRead);
    }

    // Filter by type
    if (filters.type && filters.type !== "all") {
      result = result.filter((n: any) => n.type === filters.type);
    }

    // Filter by period
    if (filters.period && filters.period !== "all") {
      const now = new Date();
      const periodDays: Record<string, number> = {
        today: 1,
        "7days": 7,
        "30days": 30,
        "90days": 90,
      };
      const days = periodDays[filters.period];
      if (days) {
        const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        result = result.filter((n: any) => new Date(n.createdAt) >= cutoffDate);
      }
    }

    // Filter by project
    if (filters.projectId) {
      result = result.filter((n: any) => n.projectId === filters.projectId);
    }

    // Filter by search text
    if (filters.searchText && filters.searchText.trim()) {
      const searchLower = filters.searchText.toLowerCase();
      result = result.filter(
        (n: any) =>
          n.title?.toLowerCase().includes(searchLower) ||
          n.message?.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [notifications, filters]);

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

        {/* Filters */}
        <NotificationFilters
          filters={filters}
          onFiltersChange={setFilters}
          projects={projects}
        />

        {/* Results Count */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Mostrando {filteredNotifications.length} de {notifications.length} notificações
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando notificações...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma notificação encontrada</h3>
              <p className="text-muted-foreground">
                {notifications.length === 0
                  ? "Você ainda não recebeu notificações"
                  : "Tente ajustar os filtros para ver mais resultados"}
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
                          <CardTitle className="text-base">{notification.title}</CardTitle>
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
