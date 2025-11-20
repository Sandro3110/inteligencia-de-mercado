import { useState } from "react";
import { useSelectedProject } from "@/hooks/useSelectedProject";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, FunnelChart, Funnel, LabelList } from "recharts";
import { Target, Award, TrendingUp, CheckCircle2 } from "lucide-react";
import { DynamicBreadcrumbs } from "@/components/DynamicBreadcrumbs";
import { useSidebarMargin } from "@/hooks/useSidebarMargin";

/**
 * Dashboard Research Overview
 * Funil de qualificação, distribuição de qualidade e evolução temporal
 */
export default function ResearchOverview() {
  const { selectedProjectId } = useSelectedProject();
  const [selectedPesquisaId, setSelectedPesquisaId] = useState<number | undefined>();
  const sidebarMargin = useSidebarMargin();

  // Buscar pesquisas do projeto
  const { data: pesquisas } = trpc.pesquisas.list.useQuery(
    undefined,
    { enabled: !!selectedProjectId }
  );

  // Buscar métricas consolidadas
  const { data: metrics, isLoading } = trpc.analytics.researchOverview.useQuery(
    { projectId: selectedProjectId!, pesquisaId: selectedPesquisaId },
    { enabled: !!selectedProjectId }
  );

  // Buscar evolução temporal
  const { data: timeline } = trpc.analytics.timelineEvolution.useQuery(
    { projectId: selectedProjectId!, days: 30 },
    { enabled: !!selectedProjectId }
  );

  if (!selectedProjectId) {
    return (
      <div className={`min-h-screen bg-background p-8 ${sidebarMargin} transition-all duration-300`}>
        <div className="text-center text-muted-foreground">
          Selecione um projeto para visualizar o Research Overview
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-background p-8 space-y-6 ${sidebarMargin} transition-all duration-300`}>
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const kpis = metrics?.kpis || {
    totalMercados: 0,
    totalLeads: 0,
    qualidadeMedia: 0,
    taxaAprovacao: 0,
  };

  const distribuicao = metrics?.distribuicaoQualidade || {
    alta: 0,
    media: 0,
    baixa: 0,
  };

  // Dados do funil de qualificação
  const funnelData = [
    { name: "Leads Gerados", value: kpis?.totalLeads || 0, fill: "#3b82f6" },
    { name: "Leads Validados", value: (kpis as any)?.totalValidados || 0, fill: "#8b5cf6" },
    { name: "Leads Aprovados", value: (kpis as any)?.totalAprovados || 0, fill: "#10b981" },
  ];

  // Dados de distribuição de qualidade
  const pieData = [
    { name: "Alta (≥80)", value: distribuicao.alta, fill: "#10b981" },
    { name: "Média (50-79)", value: distribuicao.media, fill: "#f59e0b" },
    { name: "Baixa (<50)", value: distribuicao.baixa, fill: "#ef4444" },
  ];

  // Dados de evolução temporal
  const evolutionData = timeline?.map(t => ({
    data: new Date(t.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    leads: t.leadsGerados,
    qualidade: (t.qualidadeMedia || 0) / 100,
  })) || [];

  // Top 10 mercados
  const topMercados = metrics?.topMercados || [];

  return (
    <div className={`min-h-screen bg-background ${sidebarMargin} transition-all duration-300`}>
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4">
        <DynamicBreadcrumbs />
        <div className="flex items-center justify-between mt-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Research Overview</h1>
            <p className="text-sm text-slate-600 mt-1">
              Visão geral do processo de geração e qualificação de leads
            </p>
          </div>
          
          {/* Filtro de Pesquisa */}
          <div className="w-64">
            <Select
              value={selectedPesquisaId?.toString() || "all"}
              onValueChange={(value) => setSelectedPesquisaId(value === "all" ? undefined : parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as pesquisas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as pesquisas</SelectItem>
                {pesquisas?.map(p => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 space-y-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />
                Mercados Mapeados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{kpis.totalMercados}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Award className="w-4 h-4 text-green-500" />
                Leads Gerados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{kpis.totalLeads}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                Qualidade Média
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{kpis.qualidadeMedia}/100</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-500" />
                Taxa de Aprovação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{kpis.taxaAprovacao.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos Principais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Funil de Qualificação */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Funil de Qualificação</CardTitle>
              <CardDescription>Progressão de leads no processo de validação</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={funnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribuição de Qualidade */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Distribuição de Qualidade</CardTitle>
              <CardDescription>Classificação dos leads por score de qualidade</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Evolução Temporal */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Evolução Temporal (Últimos 30 Dias)</CardTitle>
            <CardDescription>Geração de leads e qualidade média ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="leads"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Leads Gerados"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="qualidade"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Qualidade Média"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top 10 Mercados */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Top 10 Mercados por Volume</CardTitle>
            <CardDescription>Mercados com maior geração de leads</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topMercados} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="mercadoNome" type="category" width={200} />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalLeads" fill="#3b82f6" name="Total de Leads" />
                <Bar dataKey="qualidadeMedia" fill="#10b981" name="Qualidade Média" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
