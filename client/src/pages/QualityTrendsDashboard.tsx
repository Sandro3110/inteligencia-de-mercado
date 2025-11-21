/**
 * Dashboard de Tendências de Qualidade
 * Visualiza a evolução dos scores de qualidade ao longo do tempo
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Calendar, BarChart3, LineChart as LineChartIcon } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
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
} from 'recharts';

export default function QualityTrendsDashboard() {
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [days, setDays] = useState(30);
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');

  const { data: projects } = trpc.projects.list.useQuery();
  const { data: trends, isLoading } = trpc.analytics.qualityTrends.useQuery(
    { projectId: selectedProject || 0, days },
    { enabled: selectedProject !== null }
  );

  // Processar dados para o gráfico
  const chartData = trends && trends.length > 0
    ? trends[0].dataPoints.map((point: any) => ({
        data: new Date(point.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        qualidade: point.qualidadeMedia,
      }))
    : [];

  // Calcular estatísticas
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

  const renderChart = () => {
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

      default: // line
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Tendências de Qualidade</h1>
          <p className="text-muted-foreground">
            Acompanhe a evolução dos scores de qualidade dos leads ao longo do tempo
          </p>
        </div>

        {/* Filtros */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Projeto</label>
              <Select
                value={selectedProject?.toString() || ''}
                onValueChange={(value) => setSelectedProject(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um projeto" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Período</label>
              <Select value={days.toString()} onValueChange={(value) => setDays(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="15">Últimos 15 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="60">Últimos 60 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Gráfico</label>
              <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Linha</SelectItem>
                  <SelectItem value="area">Área</SelectItem>
                  <SelectItem value="bar">Barras</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {selectedProject && (
          <>
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

            {/* Gráfico */}
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
                renderChart()
              )}
            </Card>
          </>
        )}

        {!selectedProject && (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <BarChart3 className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Selecione um Projeto</h3>
              <p className="text-muted-foreground">
                Escolha um projeto acima para visualizar as tendências de qualidade
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
