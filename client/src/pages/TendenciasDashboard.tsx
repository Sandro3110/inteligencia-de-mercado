/**
 * Dashboard de Tendências Unificado
 * Combina visualização de tendências gerais de mercado e tendências de qualidade
 * Fusão de: TendenciasDashboard + QualityTrendsDashboard
 */

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Activity,
  Calendar,
  BarChart3,
  Minus,
  LineChart as LineChartIcon,
} from "lucide-react";

export default function TendenciasDashboard() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [periodoDias, setPeriodoDias] = useState<number>(30);
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  const [viewMode, setViewMode] = useState<'general' | 'quality'>('general');

  const { data: projects } = trpc.projects.list.useQuery();
  const { data: mercados } = trpc.mercados.byProject.useQuery(
    { projectId: selectedProjectId! },
    { enabled: !!selectedProjectId }
  );

  const { data: trendsData, isLoading } = trpc.analytics.qualityTrends.useQuery(
    { projectId: selectedProjectId!, days: periodoDias },
    { enabled: !!selectedProjectId }
  );

  const trends = trendsData || [];

  // ============= TENDÊNCIAS GERAIS =============
  const calcularInsights = () => {
    if (!trends || trends.length === 0) return null;

    const mercadosComQueda = trends.filter((t: any) => {
      if (t.dataPoints.length < 2) return false;
      const primeiro = t.dataPoints[0].qualidadeMedia;
      const ultimo = t.dataPoints[t.dataPoints.length - 1].qualidadeMedia;
      return ((ultimo - primeiro) / primeiro) * 100 < -10;
    });

    const melhorTendencia = trends.reduce((best: any, current: any) => {
      if (!current.dataPoints || current.dataPoints.length < 2) return best;
      const currentTrend = current.dataPoints[current.dataPoints.length - 1].qualidadeMedia - current.dataPoints[0].qualidadeMedia;
      const bestTrend = best?.dataPoints?.[best.dataPoints.length - 1]?.qualidadeMedia - best?.dataPoints?.[0]?.qualidadeMedia || -Infinity;
      return currentTrend > bestTrend ? current : best;
    }, null);

    const piorTendencia = trends.reduce((worst: any, current: any) => {
      if (!current.dataPoints || current.dataPoints.length < 2) return worst;
      const currentTrend = current.dataPoints[current.dataPoints.length - 1].qualidadeMedia - current.dataPoints[0].qualidadeMedia;
      const worstTrend = worst?.dataPoints?.[worst.dataPoints.length - 1]?.qualidadeMedia - worst?.dataPoints?.[0]?.qualidadeMedia || Infinity;
      return currentTrend < worstTrend ? current : worst;
    }, null);

    const qualidadeMediaGeral = trends.reduce((sum: number, t: any) => {
      const ultimoPonto = t.dataPoints[t.dataPoints.length - 1];
      return sum + (ultimoPonto?.qualidadeMedia || 0);
    }, 0) / trends.length;

    return {
      mercadosComQueda,
      melhorTendencia,
      piorTendencia,
      qualidadeMediaGeral: Math.round(qualidadeMediaGeral),
    };
  };

  const insights = calcularInsights();

  const prepararDadosGrafico = () => {
    if (!trends || trends.length === 0) return [];

    const todasDatas = new Set<string>();
    trends.forEach((t: any) => {
      t.dataPoints?.forEach((dp: any) => todasDatas.add(dp.data));
    });

    const datasOrdenadas = Array.from(todasDatas).sort();

    return datasOrdenadas.map((data) => {
      const ponto: any = { data };
      trends.forEach((t: any) => {
        const dp = t.dataPoints?.find((d: any) => d.data === data);
        ponto[t.mercadoNome] = dp?.qualidadeMedia || null;
      });
      return ponto;
    });
  };

  const dadosGrafico = prepararDadosGrafico();
  const cores = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  // ============= TENDÊNCIAS DE QUALIDADE =============
  const chartData = trends && trends.length > 0
    ? trends[0].dataPoints.map((point: any) => ({
        data: new Date(point.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        qualidade: point.qualidadeMedia,
      }))
    : [];

  const stats = chartData.length > 0 ? {
    atual: chartData[chartData.length - 1]?.qualidade || 0,
    anterior: chartData[chartData.length - 2]?.qualidade || 0,
    media: Math.round(chartData.reduce((acc: number, d: any) => acc + d.qualidade, 0) / chartData.length),
    max: Math.max(...chartData.map((d: any) => d.qualidade)),
    min: Math.min(...chartData.map((d: any) => d.qualidade)),
  } : null;

  const tendencia = stats ? (
    stats.atual > stats.anterior ? 'up' :
    stats.atual < stats.anterior ? 'down' : 'stable'
  ) : null;

  const renderQualityChart = () => {
    if (!chartData || chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Nenhum dado disponível para o período selecionado
        </div>
      );
    }

    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart {...commonProps}>
              <defs>
                <linearGradient id="colorQualidade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="qualidade"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorQualidade)"
                name="Qualidade Média"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="qualidade" fill="#3b82f6" name="Qualidade Média" />
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="qualidade"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Qualidade Média"
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Tendências</h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe a evolução da qualidade dos dados e tendências de mercado ao longo do tempo
          </p>
        </div>

        {/* Seletores */}
        <div className="flex gap-4 flex-wrap">
          <div className="w-64">
            <Select
              value={selectedProjectId?.toString() || ""}
              onValueChange={(v) => setSelectedProjectId(parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um projeto" />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((p: any) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-48">
            <Select
              value={periodoDias.toString()}
              onValueChange={(v) => setPeriodoDias(parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="15">Últimos 15 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="60">Últimos 60 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="180">Últimos 180 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {!selectedProjectId ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64 text-center">
              <BarChart3 className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Selecione um Projeto</h3>
              <p className="text-muted-foreground">
                Escolha um projeto acima para visualizar as tendências
              </p>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Carregando dados...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="general">
                <TrendingUp className="w-4 h-4 mr-2" />
                Tendências Gerais
              </TabsTrigger>
              <TabsTrigger value="quality">
                <Activity className="w-4 h-4 mr-2" />
                Tendências de Qualidade
              </TabsTrigger>
            </TabsList>

            {/* ABA: TENDÊNCIAS GERAIS */}
            <TabsContent value="general" className="space-y-6">
              {/* Cards de Insights */}
              {insights && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Qualidade Média Geral
                      </CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {insights.qualidadeMediaGeral}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Média de todos os mercados
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Melhor Tendência
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold truncate">
                        {insights.melhorTendencia?.mercadoNome || "N/A"}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Maior crescimento
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Pior Tendência
                      </CardTitle>
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold truncate">
                        {insights.piorTendencia?.mercadoNome || "N/A"}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Maior queda
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Alertas de Queda
                      </CardTitle>
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {insights.mercadosComQueda.length}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Queda &gt; 10% em 7 dias
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Gráfico de Evolução */}
              <Card>
                <CardHeader>
                  <CardTitle>Evolução da Qualidade ao Longo do Tempo</CardTitle>
                  <CardDescription>
                    Acompanhe a qualidade média de cada mercado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dadosGrafico.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={dadosGrafico}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="data" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        {trends.map((t: any, idx: number) => (
                          <Line
                            key={t.mercadoId}
                            type="monotone"
                            dataKey={t.mercadoNome}
                            stroke={cores[idx % cores.length]}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <p className="text-muted-foreground">
                        Nenhum dado disponível para o período selecionado
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tabela de Mercados com Maior Variação */}
              {insights && insights.mercadosComQueda.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Mercados com Queda de Qualidade</CardTitle>
                    <CardDescription>
                      Mercados que apresentaram queda superior a 10% nos últimos 7 dias
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {insights.mercadosComQueda.map((m: any) => {
                        const primeiro = m.dataPoints[0].qualidadeMedia;
                        const ultimo = m.dataPoints[m.dataPoints.length - 1].qualidadeMedia;
                        const variacao = ((ultimo - primeiro) / primeiro) * 100;

                        return (
                          <div
                            key={m.mercadoId}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{m.mercadoNome}</p>
                              <p className="text-sm text-muted-foreground">
                                {primeiro}% → {ultimo}%
                              </p>
                            </div>
                            <Badge variant="destructive">
                              {variacao.toFixed(1)}%
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ABA: TENDÊNCIAS DE QUALIDADE */}
            <TabsContent value="quality" className="space-y-6">
              {/* Controle de Tipo de Gráfico */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LineChartIcon className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">Tipo de Visualização</span>
                  </div>
                  <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="line">Linha</SelectItem>
                      <SelectItem value="area">Área</SelectItem>
                      <SelectItem value="bar">Barras</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Card>

              {/* Estatísticas */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Atual</span>
                      {tendencia === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                      {tendencia === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                      {tendencia === 'stable' && <Minus className="w-4 h-4 text-gray-500" />}
                    </div>
                    <p className="text-2xl font-bold">{stats.atual}</p>
                    <Badge
                      variant={tendencia === 'up' ? 'default' : tendencia === 'down' ? 'destructive' : 'secondary'}
                      className="mt-2"
                    >
                      {tendencia === 'up' && '↑ Subindo'}
                      {tendencia === 'down' && '↓ Caindo'}
                      {tendencia === 'stable' && '→ Estável'}
                    </Badge>
                  </Card>

                  <Card className="p-4">
                    <span className="text-sm text-muted-foreground">Média</span>
                    <p className="text-2xl font-bold mt-2">{stats.media}</p>
                    <p className="text-xs text-muted-foreground mt-2">Período completo</p>
                  </Card>

                  <Card className="p-4">
                    <span className="text-sm text-muted-foreground">Máximo</span>
                    <p className="text-2xl font-bold text-green-600 mt-2">{stats.max}</p>
                    <p className="text-xs text-muted-foreground mt-2">Melhor score</p>
                  </Card>

                  <Card className="p-4">
                    <span className="text-sm text-muted-foreground">Mínimo</span>
                    <p className="text-2xl font-bold text-red-600 mt-2">{stats.min}</p>
                    <p className="text-xs text-muted-foreground mt-2">Pior score</p>
                  </Card>

                  <Card className="p-4">
                    <span className="text-sm text-muted-foreground">Variação</span>
                    <p className="text-2xl font-bold mt-2">
                      {stats.atual - stats.anterior > 0 ? '+' : ''}
                      {stats.atual - stats.anterior}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">vs. anterior</p>
                  </Card>
                </div>
              )}

              {/* Gráfico de Qualidade */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Evolução da Qualidade</h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {chartData.length} pontos de dados
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  renderQualityChart()
                )}
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
