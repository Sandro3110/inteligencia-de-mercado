import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import {
  LineChart,
  Line,
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
} from "lucide-react";

export default function TendenciasDashboard() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [periodoDias, setPeriodoDias] = useState<number>(30);

  const { data: projects } = trpc.projects.list.useQuery();
  const { data: mercados } = trpc.mercados.byProject.useQuery(
    { projectId: selectedProjectId! },
    { enabled: !!selectedProjectId }
  );

  // Query de tendências (será implementada no backend)
  const { data: trendsData, isLoading } = trpc.analytics.qualityTrends.useQuery(
    { projectId: selectedProjectId!, days: periodoDias },
    { enabled: !!selectedProjectId }
  );

  const trends = trendsData || [];

  // Calcular insights
  const calcularInsights = () => {
    if (!trends || trends.length === 0) {
      return null;
    }

    const mercadosComQueda = trends.filter((t: any) => {
      if (t.dataPoints.length < 2) {
        return false;
      }
      const primeiro = t.dataPoints[0].qualidadeMedia;
      const ultimo = t.dataPoints[t.dataPoints.length - 1].qualidadeMedia;
      return ((ultimo - primeiro) / primeiro) * 100 < -10;
    });

    const melhorTendencia = trends.reduce((best: any, current: any) => {
      if (!current.dataPoints || current.dataPoints.length < 2) {
        return best;
      }
      const currentTrend =
        current.dataPoints[current.dataPoints.length - 1].qualidadeMedia -
        current.dataPoints[0].qualidadeMedia;
      const bestTrend =
        best?.dataPoints?.[best.dataPoints.length - 1]?.qualidadeMedia -
          best?.dataPoints?.[0]?.qualidadeMedia || -Infinity;
      return currentTrend > bestTrend ? current : best;
    }, null);

    const piorTendencia = trends.reduce((worst: any, current: any) => {
      if (!current.dataPoints || current.dataPoints.length < 2) {
        return worst;
      }
      const currentTrend =
        current.dataPoints[current.dataPoints.length - 1].qualidadeMedia -
        current.dataPoints[0].qualidadeMedia;
      const worstTrend =
        worst?.dataPoints?.[worst.dataPoints.length - 1]?.qualidadeMedia -
          worst?.dataPoints?.[0]?.qualidadeMedia || Infinity;
      return currentTrend < worstTrend ? current : worst;
    }, null);

    const qualidadeMediaGeral =
      trends.reduce((sum: number, t: any) => {
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

  // Preparar dados para o gráfico
  const prepararDadosGrafico = () => {
    if (!trends || trends.length === 0) {
      return [];
    }

    const todasDatas = new Set<string>();
    trends.forEach((t: any) => {
      t.dataPoints?.forEach((dp: any) => todasDatas.add(dp.data));
    });

    const datasOrdenadas = Array.from(todasDatas).sort();

    return datasOrdenadas.map(data => {
      const ponto: any = { data };
      trends.forEach((t: any) => {
        const dp = t.dataPoints?.find((d: any) => d.data === data);
        ponto[t.mercadoNome] = dp?.qualidadeMedia || null;
      });
      return ponto;
    });
  };

  const dadosGrafico = prepararDadosGrafico();
  const cores = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard de Tendências
          </h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe a evolução da qualidade dos dados ao longo do tempo
          </p>
        </div>

        {/* Seletores */}
        <div className="flex gap-4">
          <div className="w-64">
            <Select
              value={selectedProjectId?.toString() || ""}
              onValueChange={v => setSelectedProjectId(parseInt(v))}
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
              onValueChange={v => setPeriodoDias(parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="180">Últimos 180 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {!selectedProjectId ? (
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">
                Selecione um projeto para visualizar as tendências
              </p>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Carregando...</p>
            </CardContent>
          </Card>
        ) : (
          <>
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
                    Mercados que apresentaram queda superior a 10% nos últimos 7
                    dias
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {insights.mercadosComQueda.map((m: any) => {
                      const primeiro = m.dataPoints[0].qualidadeMedia;
                      const ultimo =
                        m.dataPoints[m.dataPoints.length - 1].qualidadeMedia;
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
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
