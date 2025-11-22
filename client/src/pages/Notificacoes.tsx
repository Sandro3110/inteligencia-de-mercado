import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
  Clock,
  RefreshCw,
  Download,
  Filter,
  FileText,
  TrendingUp,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import {
  NotificationFilters,
  NotificationFiltersState,
} from "@/components/NotificationFilters";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
const FILTERS_STORAGE_KEY = "notification-filters";

interface Notification {
  id: number;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  isRead?: number;
  createdAt: Date;
}

export default function Notificacoes() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState("recentes");

  // Estados para aba Recentes
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

  // Estados para aba SSE (Dashboard em Tempo Real)
  const [sseNotifications, setSseNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  // Estados para aba Histórico
  const [period, setPeriod] = useState<number>(30);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Save filters to localStorage
  useEffect(() => {
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  // Queries
  const { data: notifications = [], isLoading } = trpc.notifications.list.useQuery();
  const { data: unreadCount = 0 } = trpc.notifications.unreadCount.useQuery();
  const { data: projects = [] } = trpc.projects.list.useQuery();
  const { data: stats } = trpc.notifications.getStats.useQuery(undefined, {
    enabled: !!user,
  });

  // Mutations
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
      utils.notifications.getStats.invalidate();
    },
  });

  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
      utils.notifications.getStats.invalidate();
      setSseNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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

  // Conectar ao SSE quando aba "recentes" estiver ativa
  useEffect(() => {
    if (!user || activeTab !== "recentes") return;

    const es = new EventSource("/api/notifications/stream");

    es.addEventListener("connected", (e) => {
      const data = JSON.parse(e.data);
      console.log("[SSE] Conectado:", data);
      setIsConnected(true);
    });

    es.addEventListener("initial", (e) => {
      const data = JSON.parse(e.data);
      console.log("[SSE] Notificações iniciais:", data.notifications);
      setSseNotifications(data.notifications);
    });

    es.addEventListener("notification", (e) => {
      const notification = JSON.parse(e.data);
      console.log("[SSE] Nova notificação:", notification);
      setSseNotifications((prev) => [notification, ...prev]);
      toast.info(notification.title, {
        description: notification.message,
      });
    });

    es.addEventListener("update", (e) => {
      const updated = JSON.parse(e.data);
      console.log("[SSE] Notificação atualizada:", updated);
      setSseNotifications((prev) =>
        prev.map((n) => (n.id === updated.id ? updated : n))
      );
    });

    es.onerror = (error) => {
      console.error("[SSE] Erro:", error);
      setIsConnected(false);
    };

    setEventSource(es);

    return () => {
      es.close();
      setIsConnected(false);
    };
  }, [user, activeTab]);

  // Apply filters para aba de listagem
  const filteredNotifications = useMemo(() => {
    let result = [...notifications];

    if (filters.status === "read") {
      result = result.filter((n: any) => n.isRead);
    } else if (filters.status === "unread") {
      result = result.filter((n: any) => !n.isRead);
    }

    if (filters.type && filters.type !== "all") {
      result = result.filter((n: any) => n.type === filters.type);
    }

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

    if (filters.projectId) {
      result = result.filter((n: any) => n.projectId === filters.projectId);
    }

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

  // Filtrar notificações para aba Histórico
  const historyNotifications = notifications?.filter((notif: any) => {
    const createdDate = new Date(notif.createdAt);
    const daysDiff = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > period) return false;
    if (typeFilter !== 'all' && notif.type !== typeFilter) return false;
    if (statusFilter === 'read' && notif.isRead === 0) return false;
    if (statusFilter === 'unread' && notif.isRead === 1) return false;
    
    return true;
  }) || [];

  // Estatísticas para aba Histórico
  const historyStats = {
    total: historyNotifications.length,
    read: historyNotifications.filter((n: any) => n.isRead === 1).length,
    unread: historyNotifications.filter((n: any) => n.isRead === 0).length,
    readRate: historyNotifications.length > 0 
      ? Math.round((historyNotifications.filter((n: any) => n.isRead === 1).length / historyNotifications.length) * 100)
      : 0,
  };

  // Dados para gráfico de tipos
  const typeData = Object.entries(
    historyNotifications.reduce((acc: any, notif: any) => {
      acc[notif.type] = (acc[notif.type] || 0) + 1;
      return acc;
    }, {})
  ).map(([type, count]) => ({
    name: notificationLabels[type] || type,
    value: count,
  }));

  // Dados para gráfico de timeline
  const timelineData = historyNotifications.reduce((acc: any, notif: any) => {
    const date = format(new Date(notif.createdAt), 'dd/MM', { locale: ptBR });
    if (!acc[date]) {
      acc[date] = { date, total: 0, lidas: 0 };
    }
    acc[date].total++;
    if (notif.isRead === 1) acc[date].lidas++;
    return acc;
  }, {});

  const timelineArray = Object.values(timelineData).slice(-14);

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate({ id });
    setSseNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleExport = () => {
    const csv = [
      ['Data', 'Tipo', 'Título', 'Mensagem', 'Status'].join(','),
      ...historyNotifications.map((notif: any) => [
        format(new Date(notif.createdAt), 'dd/MM/yyyy HH:mm'),
        notificationLabels[notif.type] || notif.type,
        `"${notif.title}"`,
        `"${notif.message}"`,
        notif.isRead === 1 ? 'Lida' : 'Não lida',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `notificacoes-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    
    toast.success('Histórico exportado com sucesso!');
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
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Bell className="h-8 w-8" />
              Central de Notificações
            </h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe notificações em tempo real, histórico e estatísticas
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recentes">
              <Bell className="h-4 w-4 mr-2" />
              Recentes (Tempo Real)
            </TabsTrigger>
            <TabsTrigger value="historico">
              <FileText className="h-4 w-4 mr-2" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="estatisticas">
              <TrendingUp className="h-4 w-4 mr-2" />
              Estatísticas
            </TabsTrigger>
          </TabsList>

          {/* ABA 1: RECENTES (Tempo Real com SSE) */}
          <TabsContent value="recentes" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <Badge variant="default" className="gap-1">
                    <Bell className="h-3 w-3" />
                    Conectado (SSE)
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1">
                    <BellOff className="h-3 w-3" />
                    Desconectado
                  </Badge>
                )}
              </div>
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

            {/* Estatísticas em Tempo Real */}
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

            {/* Lista de Notificações em Tempo Real */}
            <Card>
              <CardHeader>
                <CardTitle>Notificações em Tempo Real</CardTitle>
                <CardDescription>
                  Stream SSE ativo - novas notificações aparecem automaticamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sseNotifications.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma notificação ainda</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sseNotifications.map((notification) => (
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
          </TabsContent>

          {/* ABA 2: HISTÓRICO */}
          <TabsContent value="historico" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Histórico e Analytics
                </h2>
                <p className="text-muted-foreground mt-1">
                  Visualize estatísticas e histórico completo de notificações
                </p>
              </div>

              <Button onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </div>

            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">
                    Período
                  </label>
                  <Select value={period.toString()} onValueChange={(v) => setPeriod(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Últimos 7 dias</SelectItem>
                      <SelectItem value="30">Últimos 30 dias</SelectItem>
                      <SelectItem value="90">Últimos 90 dias</SelectItem>
                      <SelectItem value="365">Último ano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">
                    Tipo
                  </label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      {Object.entries(notificationLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">
                    Status
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="read">Lidas</SelectItem>
                      <SelectItem value="unread">Não lidas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total</p>
                      <p className="text-3xl font-bold mt-1">{historyStats.total}</p>
                    </div>
                    <Bell className="w-10 h-10 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Lidas</p>
                      <p className="text-3xl font-bold text-green-600 mt-1">{historyStats.read}</p>
                    </div>
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Não Lidas</p>
                      <p className="text-3xl font-bold text-orange-600 mt-1">{historyStats.unread}</p>
                    </div>
                    <Clock className="w-10 h-10 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Taxa de Leitura</p>
                      <p className="text-3xl font-bold text-purple-600 mt-1">{historyStats.readRate}%</p>
                    </div>
                    <TrendingUp className="w-10 h-10 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gráfico de Tipos */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Tipo</CardTitle>
                  <CardDescription>Quantidade de notificações por tipo</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={typeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {typeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Gráfico de Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Timeline de Notificações</CardTitle>
                  <CardDescription>Notificações recebidas e lidas ao longo do tempo</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timelineArray}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="total" stroke="#3b82f6" name="Total" />
                      <Line type="monotone" dataKey="lidas" stroke="#10b981" name="Lidas" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ABA 3: ESTATÍSTICAS (Lista Filtrada) */}
          <TabsContent value="estatisticas" className="space-y-6">
            <NotificationFilters
              filters={filters}
              onFiltersChange={setFilters}
              projects={projects}
            />

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
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
