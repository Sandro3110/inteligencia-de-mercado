import { trpc } from '@/lib/trpc';
import { useSelectedProject } from '@/hooks/useSelectedProject';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  AlertCircle,
  Clock,
  Zap,
} from 'lucide-react';

const COLORS = {
  completed: '#22c55e',
  error: '#ef4444',
  pending: '#eab308',
  processing: '#3b82f6',
};

export default function QueueMetrics() {
  const { selectedProjectId } = useSelectedProject();

  const { data: metrics, isLoading } = trpc.queue.metrics.useQuery(
    { projectId: selectedProjectId! },
    { enabled: !!selectedProjectId, refetchInterval: 30000 } // Atualizar a cada 30s
  );

  if (!selectedProjectId) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Selecione um projeto para visualizar as métricas
          </p>
        </div>
      </div>
    );
  }

  if (isLoading || !metrics) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando métricas...</p>
        </div>
      </div>
    );
  }

  const statusData = [
    { name: 'Concluídos', value: metrics.stats.totalCompleted, color: COLORS.completed },
    { name: 'Erros', value: metrics.stats.totalErrors, color: COLORS.error },
    { name: 'Pendentes', value: metrics.stats.totalPending, color: COLORS.pending },
  ];

  const recentActivityData = [
    { name: 'Total', value: metrics.recentActivity.last24Hours },
    { name: 'Concluídos', value: metrics.recentActivity.completedLast24h },
    { name: 'Erros', value: metrics.recentActivity.errorsLast24h },
  ];

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Métricas da Fila</h1>
        <p className="text-muted-foreground mt-1">
          Análise de performance e estatísticas de processamento
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Throughput</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.throughput}</div>
            <p className="text-xs text-muted-foreground">jobs/hora (últimas 24h)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Erro</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {metrics.errorRate}%
              {metrics.errorRate > 10 ? (
                <TrendingUp className="h-4 w-4 text-red-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.errorRate > 10 ? 'Acima do esperado' : 'Dentro do esperado'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTime(metrics.avgProcessingTimeMs)}
            </div>
            <p className="text-xs text-muted-foreground">por job</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modo Atual</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={metrics.currentMode === 'parallel' ? 'default' : 'secondary'}>
              {metrics.currentMode === 'parallel' ? 'Paralelo' : 'Sequencial'}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.stats.total} jobs processados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por Status */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
            <CardDescription>Total de jobs por status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Atividade Recente */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimas 24 horas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={recentActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {metrics.errorRate > 10 && (
            <div className="flex items-start gap-3 p-3 border border-red-200 rounded-lg bg-red-50">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Alta taxa de erro detectada</p>
                <p className="text-sm text-red-700">
                  Verifique os logs de erro no histórico para identificar problemas recorrentes
                </p>
              </div>
            </div>
          )}

          {metrics.throughput < 1 && metrics.stats.totalPending > 10 && (
            <div className="flex items-start gap-3 p-3 border border-yellow-200 rounded-lg bg-yellow-50">
              <TrendingDown className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">Throughput baixo</p>
                <p className="text-sm text-yellow-700">
                  Considere mudar para modo paralelo para processar jobs mais rapidamente
                </p>
              </div>
            </div>
          )}

          {metrics.avgProcessingTimeMs > 60000 && (
            <div className="flex items-start gap-3 p-3 border border-blue-200 rounded-lg bg-blue-50">
              <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Tempo de processamento elevado</p>
                <p className="text-sm text-blue-700">
                  Tempo médio acima de 1 minuto. Verifique se há otimizações possíveis no processo de enriquecimento
                </p>
              </div>
            </div>
          )}

          {metrics.errorRate <= 10 && metrics.throughput >= 1 && (
            <div className="flex items-start gap-3 p-3 border border-green-200 rounded-lg bg-green-50">
              <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Performance saudável</p>
                <p className="text-sm text-green-700">
                  A fila está operando dentro dos parâmetros esperados
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
