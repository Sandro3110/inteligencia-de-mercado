import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { 
  Download, Calendar, TrendingUp, Eye, Bell, 
  Filter, FileText, CheckCircle2, Clock 
} from "lucide-react";
import { DynamicBreadcrumbs } from "@/components/DynamicBreadcrumbs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  lead_quality: 'Qualidade de Lead',
  lead_closed: 'Lead Fechado',
  new_competitor: 'Novo Concorrente',
  market_threshold: 'Limite de Mercado',
  data_incomplete: 'Dados Incompletos',
  enrichment: 'Enriquecimento',
  validation: 'Validação',
  export: 'Exportação',
};

export default function NotificationHistory() {
  const [period, setPeriod] = useState<number>(30);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: notifications, isLoading } = trpc.notifications.list.useQuery();

  // Filtrar notificações
  const filteredNotifications = notifications?.filter((notif: any) => {
    const createdDate = new Date(notif.createdAt);
    const daysDiff = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > period) return false;
    if (typeFilter !== 'all' && notif.type !== typeFilter) return false;
    if (statusFilter === 'read' && notif.isRead === 0) return false;
    if (statusFilter === 'unread' && notif.isRead === 1) return false;
    
    return true;
  }) || [];

  // Estatísticas
  const stats = {
    total: filteredNotifications.length,
    read: filteredNotifications.filter((n: any) => n.isRead === 1).length,
    unread: filteredNotifications.filter((n: any) => n.isRead === 0).length,
    readRate: filteredNotifications.length > 0 
      ? Math.round((filteredNotifications.filter((n: any) => n.isRead === 1).length / filteredNotifications.length) * 100)
      : 0,
  };

  // Dados para gráfico de tipos
  const typeData = Object.entries(
    filteredNotifications.reduce((acc: any, notif: any) => {
      acc[notif.type] = (acc[notif.type] || 0) + 1;
      return acc;
    }, {})
  ).map(([type, count]) => ({
    name: NOTIFICATION_TYPE_LABELS[type] || type,
    value: count,
  }));

  // Dados para gráfico de timeline
  const timelineData = filteredNotifications.reduce((acc: any, notif: any) => {
    const date = format(new Date(notif.createdAt), 'dd/MM', { locale: ptBR });
    if (!acc[date]) {
      acc[date] = { date, total: 0, lidas: 0 };
    }
    acc[date].total++;
    if (notif.isRead === 1) acc[date].lidas++;
    return acc;
  }, {});

  const timelineArray = Object.values(timelineData).slice(-14); // Últimos 14 dias

  // Exportar para CSV
  const handleExport = () => {
    const csv = [
      ['Data', 'Tipo', 'Título', 'Mensagem', 'Status'].join(','),
      ...filteredNotifications.map((notif: any) => [
        format(new Date(notif.createdAt), 'dd/MM/yyyy HH:mm'),
        NOTIFICATION_TYPE_LABELS[notif.type] || notif.type,
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <DynamicBreadcrumbs />
      
      <div className="max-w-7xl mx-auto space-y-6 mt-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              Histórico e Analytics de Notificações
            </h1>
            <p className="text-slate-600 mt-2">
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
              <label className="text-sm font-medium text-slate-700 mb-2 block">
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
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Tipo
              </label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {Object.entries(NOTIFICATION_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 mb-2 block">
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
                  <p className="text-sm font-medium text-slate-600">Total</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
                </div>
                <Bell className="w-10 h-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Lidas</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{stats.read}</p>
                </div>
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Não Lidas</p>
                  <p className="text-3xl font-bold text-orange-600 mt-1">{stats.unread}</p>
                </div>
                <Clock className="w-10 h-10 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Taxa de Leitura</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">{stats.readRate}%</p>
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

        {/* Tabela de Histórico */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico Completo</CardTitle>
            <CardDescription>
              {filteredNotifications.length} notificações encontradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma notificação encontrada com os filtros selecionados</p>
                </div>
              ) : (
                filteredNotifications.map((notif: any) => (
                  <div
                    key={notif.id}
                    className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">{notif.title}</h3>
                        <Badge variant={notif.isRead === 1 ? "secondary" : "default"}>
                          {NOTIFICATION_TYPE_LABELS[notif.type] || notif.type}
                        </Badge>
                        {notif.isRead === 1 && (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{notif.message}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        {format(new Date(notif.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
