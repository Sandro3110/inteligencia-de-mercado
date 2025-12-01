'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BarChart3,
  Filter,
  Download,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type MetricType = 'query' | 'api' | 'background_job' | undefined;

export default function MetricsPage() {
  const [metricType, setMetricType] = useState<MetricType>(undefined);
  const [limit, setLimit] = useState(20);

  // Queries
  const { data: summary, isLoading: loadingSummary } = trpc.metrics.getSummary.useQuery({
    metricType,
    limit,
  });

  const { data: slowQueries, isLoading: loadingSlowQueries } = trpc.metrics.getSlowQueries.useQuery(
    {
      limit: 10,
      minTimeMs: 1000,
    }
  );

  // Calcular estatísticas gerais
  const totalExecutions = summary?.reduce((acc, m) => acc + (m.total_executions || 0), 0) || 0;
  const avgTime =
    summary?.reduce((acc, m) => acc + (m.avg_time_ms || 0), 0) / (summary?.length || 1) || 0;
  const successRate =
    summary?.reduce((acc, m) => acc + (m.success_rate || 0), 0) / (summary?.length || 1) || 0;
  const totalErrors = summary?.reduce((acc, m) => acc + (m.error_count || 0), 0) || 0;

  // Exportar dados
  const handleExport = () => {
    if (!summary) return;

    const csv = [
      ['Metric Name', 'Type', 'Executions', 'Avg Time (ms)', 'P95 (ms)', 'Success Rate (%)'],
      ...summary.map((m) => [
        m.metric_name,
        m.metric_type,
        m.total_executions,
        m.avg_time_ms,
        m.p95_time_ms,
        m.success_rate,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metrics_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Métricas exportadas com sucesso');
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Metrics</h1>
          <p className="text-muted-foreground mt-1">
            Monitoramento de performance do sistema (últimos 7 dias)
          </p>
        </div>
        <Button onClick={handleExport} disabled={!summary || summary.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Execuções</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExecutions.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgTime)}ms</div>
            <p className="text-xs text-muted-foreground">
              {avgTime < 500 ? (
                <span className="text-green-600 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  Excelente
                </span>
              ) : avgTime < 1000 ? (
                <span className="text-yellow-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Bom
                </span>
              ) : (
                <span className="text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Atenção
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {successRate >= 99 ? (
                <span className="text-green-600">Ótimo</span>
              ) : successRate >= 95 ? (
                <span className="text-yellow-600">Bom</span>
              ) : (
                <span className="text-red-600">Crítico</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Erros</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalErrors}</div>
            <p className="text-xs text-muted-foreground">
              {totalErrors === 0 ? (
                <span className="text-green-600">Nenhum erro</span>
              ) : totalErrors < 10 ? (
                <span className="text-yellow-600">Poucos erros</span>
              ) : (
                <span className="text-red-600">Muitos erros</span>
              )}
            </p>
          </CardContent>
        </Card>
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
            <label className="text-sm font-medium mb-2 block">Tipo de Métrica</label>
            <Select
              value={metricType || 'all'}
              onValueChange={(value) =>
                setMetricType(value === 'all' ? undefined : (value as MetricType))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="query">Queries</SelectItem>
                <SelectItem value="api">APIs</SelectItem>
                <SelectItem value="background_job">Background Jobs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-32">
            <label className="text-sm font-medium mb-2 block">Limite</label>
            <Select value={limit.toString()} onValueChange={(value) => setLimit(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Queries Lentas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Top 10 Queries Mais Lentas
          </CardTitle>
          <CardDescription>Queries com tempo de execução acima de 1 segundo</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingSlowQueries ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : !slowQueries || slowQueries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <p>Nenhuma query lenta detectada! 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {slowQueries.map((query, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium">{query.metric_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {query.record_count && `${query.record_count} registros`}
                      {query.created_at &&
                        ` • ${new Date(query.created_at).toLocaleString('pt-BR')}`}
                    </div>
                  </div>
                  <Badge variant={query.execution_time_ms > 5000 ? 'destructive' : 'secondary'}>
                    {query.execution_time_ms}ms
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo de Métricas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Resumo de Métricas
          </CardTitle>
          <CardDescription>Estatísticas agregadas por métrica (últimos 7 dias)</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingSummary ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : !summary || summary.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma métrica coletada ainda
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Métrica</th>
                    <th className="text-left py-3 px-4 font-medium">Tipo</th>
                    <th className="text-right py-3 px-4 font-medium">Execuções</th>
                    <th className="text-right py-3 px-4 font-medium">Tempo Médio</th>
                    <th className="text-right py-3 px-4 font-medium">P95</th>
                    <th className="text-right py-3 px-4 font-medium">Taxa de Sucesso</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.map((metric, i) => (
                    <tr key={i} className="border-b hover:bg-accent transition-colors">
                      <td className="py-3 px-4 font-medium">{metric.metric_name}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{metric.metric_type}</Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {metric.total_executions?.toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={
                            (metric.avg_time_ms || 0) < 500
                              ? 'text-green-600'
                              : (metric.avg_time_ms || 0) < 1000
                                ? 'text-yellow-600'
                                : 'text-red-600'
                          }
                        >
                          {metric.avg_time_ms}ms
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={
                            (metric.p95_time_ms || 0) < 1000
                              ? 'text-green-600'
                              : (metric.p95_time_ms || 0) < 2000
                                ? 'text-yellow-600'
                                : 'text-red-600'
                          }
                        >
                          {metric.p95_time_ms}ms
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={
                            (metric.success_rate || 0) >= 99
                              ? 'text-green-600'
                              : (metric.success_rate || 0) >= 95
                                ? 'text-yellow-600'
                                : 'text-red-600'
                          }
                        >
                          {metric.success_rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
