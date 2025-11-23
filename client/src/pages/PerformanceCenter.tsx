/**
 * Performance e Conversão Unificado
 * Fusão de: ROIDashboard + FunnelView + ResearchOverview
 *
 * Layout com 3 seções verticais:
 * - Seção superior: Métricas de ROI e conversões
 * - Seção central: Funil de conversão visual
 * - Seção inferior: Overview de pesquisas e evolução temporal
 */

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useSelectedProject } from "@/hooks/useSelectedProject";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  DollarSign,
  TrendingUp,
  Target,
  Award,
  Plus,
  TrendingDown,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"];

export default function PerformanceCenter() {
  const { selectedProjectId } = useSelectedProject();
  const [showConversionDialog, setShowConversionDialog] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [dealValue, setDealValue] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"won" | "lost">("won");
  const [selectedPesquisaId, setSelectedPesquisaId] = useState<
    number | undefined
  >();

  // Queries - ROI
  const { data: roiMetrics, refetch: refetchRoiMetrics } =
    trpc.roi.metrics.useQuery(
      { projectId: selectedProjectId! },
      { enabled: !!selectedProjectId }
    );

  const { data: conversions, refetch: refetchConversions } =
    trpc.conversion.list.useQuery(
      { projectId: selectedProjectId! },
      { enabled: !!selectedProjectId }
    );

  const { data: allLeads } = trpc.leads.list.useQuery(
    { projectId: selectedProjectId ?? undefined },
    { enabled: !!selectedProjectId }
  );

  // Queries - Funil
  const { data: funnelData, isLoading: funnelLoading } =
    trpc.funnel.data.useQuery(
      { projectId: selectedProjectId! },
      { enabled: !!selectedProjectId }
    );

  // Queries - Research Overview
  const { data: pesquisas } = trpc.pesquisas.list.useQuery(undefined, {
    enabled: !!selectedProjectId,
  });

  const { data: researchMetrics, isLoading: researchLoading } =
    trpc.analytics.researchOverview.useQuery(
      { projectId: selectedProjectId!, pesquisaId: selectedPesquisaId },
      { enabled: !!selectedProjectId }
    );

  const { data: timeline } = trpc.analytics.timelineEvolution.useQuery(
    { projectId: selectedProjectId!, days: 30 },
    { enabled: !!selectedProjectId }
  );

  // Mutations
  const createConversionMutation = trpc.conversion.create.useMutation();
  const logActivityMutation = trpc.activity.log.useMutation();

  const handleCreateConversion = async () => {
    if (!selectedLeadId || !selectedProjectId) {
      toast.error("Selecione um lead");
      return;
    }

    try {
      await createConversionMutation.mutateAsync({
        leadId: selectedLeadId,
        projectId: selectedProjectId,
        dealValue: dealValue ? parseFloat(dealValue) : undefined,
        notes,
        status,
      });

      toast.success("Conversão registrada com sucesso!");

      const leadName =
        allLeads?.find((l: any) => l.id === selectedLeadId)?.nome ||
        `Lead #${selectedLeadId}`;
      await logActivityMutation.mutateAsync({
        projectId: selectedProjectId,
        activityType: "conversion",
        description: `Conversão registrada: ${leadName} - ${status === "won" ? "Ganho" : "Perdido"} - R$ ${parseFloat(dealValue || "0").toFixed(2)}`,
        metadata: JSON.stringify({
          leadId: selectedLeadId,
          dealValue,
          status,
          notes,
        }),
      });

      setShowConversionDialog(false);
      setSelectedLeadId(null);
      setDealValue("");
      setNotes("");
      setStatus("won");
      refetchRoiMetrics();
      refetchConversions();
    } catch (error) {
      console.error("Erro ao criar conversão:", error);
      toast.error("Erro ao registrar conversão");
    }
  };

  if (!selectedProjectId) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-8">
          <div className="text-center text-muted-foreground">
            Selecione um projeto para visualizar Performance e Conversão
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Preparar dados para gráficos
  const roiChartData =
    roiMetrics?.conversionsByMarket.map((m: any) => ({
      name: m.mercadoNome?.substring(0, 20) || "Sem nome",
      conversions: m.conversions,
      value: parseFloat(m.totalValue || "0"),
    })) || [];

  const funnelChartData =
    funnelData?.funnelData.map((item: any) => ({
      name: item.stage.charAt(0).toUpperCase() + item.stage.slice(1),
      value: item.count,
      fill: getStageColor(item.stage),
    })) || [];

  const kpis = researchMetrics?.kpis || {
    totalMercados: 0,
    totalLeads: 0,
    qualidadeMedia: 0,
    taxaAprovacao: 0,
  };

  const distribuicao = researchMetrics?.distribuicaoQualidade || {
    alta: 0,
    media: 0,
    baixa: 0,
  };

  const researchFunnelData = [
    { name: "Leads Gerados", value: kpis?.totalLeads || 0, fill: "#3b82f6" },
    {
      name: "Leads Validados",
      value: (kpis as any)?.totalValidados || 0,
      fill: "#8b5cf6",
    },
    {
      name: "Leads Aprovados",
      value: (kpis as any)?.totalAprovados || 0,
      fill: "#10b981",
    },
  ];

  const pieData = [
    { name: "Alta (≥80)", value: distribuicao.alta, fill: "#10b981" },
    { name: "Média (50-79)", value: distribuicao.media, fill: "#f59e0b" },
    { name: "Baixa (<50)", value: distribuicao.baixa, fill: "#ef4444" },
  ];

  const evolutionData =
    timeline?.map((t: any) => ({
      data: new Date(t.data).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }),
      leads: t.leadsGerados,
      qualidade: (t.qualidadeMedia || 0) / 100,
    })) || [];

  function getStageColor(stage: string) {
    const colors: Record<string, string> = {
      novo: "#3b82f6",
      qualificado: "#10b981",
      negociacao: "#f59e0b",
      fechado: "#8b5cf6",
      perdido: "#ef4444",
    };
    return colors[stage] || "#6b7280";
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Performance e Conversão</h1>
            <p className="text-muted-foreground mt-1">
              Análise integrada de ROI, funil de vendas e overview de pesquisas
            </p>
          </div>
          <Button
            onClick={() => setShowConversionDialog(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Registrar Conversão
          </Button>
        </div>

        {/* SEÇÃO 1: Métricas de ROI */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-600" />
            ROI e Conversões
          </h2>

          {!roiMetrics ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total de Leads
                    </CardTitle>
                    <Target className="w-4 h-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {roiMetrics.totalLeads}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Conversões
                    </CardTitle>
                    <Award className="w-4 h-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {roiMetrics.totalConversions}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Taxa de Conversão
                    </CardTitle>
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {roiMetrics.conversionRate.toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Valor Médio
                    </CardTitle>
                    <DollarSign className="w-4 h-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      R$ {roiMetrics.averageDealValue.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Conversões por Mercado</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={roiChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="conversions"
                        fill="#8b5cf6"
                        name="Conversões"
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="value"
                        fill="#10b981"
                        name="Valor (R$)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* SEÇÃO 2: Funil de Conversão */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-blue-600" />
            Funil de Vendas
          </h2>

          {funnelLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : !funnelData ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Nenhum dado de funil disponível
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Total de Leads no Funil</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">
                    {funnelData.totalLeads}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Visualização do Funil</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <FunnelChart>
                      <Tooltip />
                      <Funnel
                        dataKey="value"
                        data={funnelChartData}
                        isAnimationActive
                      >
                        <LabelList
                          position="right"
                          fill="#000"
                          stroke="none"
                          dataKey="name"
                        />
                      </Funnel>
                    </FunnelChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {funnelData.funnelData.map((stage: any) => (
                  <Card key={stage.stage}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium capitalize">
                        {stage.stage}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stage.count}</div>
                      <p className="text-xs text-muted-foreground">
                        {((stage.count / funnelData.totalLeads) * 100).toFixed(
                          1
                        )}
                        % do total
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>

        {/* SEÇÃO 3: Overview de Pesquisas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              Overview de Pesquisas
            </h2>
            {pesquisas && pesquisas.length > 0 && (
              <Select
                value={selectedPesquisaId?.toString() || "all"}
                onValueChange={v =>
                  setSelectedPesquisaId(v === "all" ? undefined : parseInt(v))
                }
              >
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Todas as pesquisas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as pesquisas</SelectItem>
                  {pesquisas.map((p: any) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {researchLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total de Mercados
                    </CardTitle>
                    <Target className="w-4 h-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {kpis.totalMercados}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total de Leads
                    </CardTitle>
                    <Award className="w-4 h-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{kpis.totalLeads}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Qualidade Média
                    </CardTitle>
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {kpis.qualidadeMedia.toFixed(0)}%
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Taxa de Aprovação
                    </CardTitle>
                    <CheckCircle2 className="w-4 h-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {kpis.taxaAprovacao.toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição de Qualidade</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={entry => `${entry.name}: ${entry.value}`}
                          outerRadius={80}
                          fill="#8884d8"
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

                <Card>
                  <CardHeader>
                    <CardTitle>Evolução Temporal (30 dias)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={evolutionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="data" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="leads"
                          stroke="#3b82f6"
                          name="Leads Gerados"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="qualidade"
                          stroke="#10b981"
                          name="Qualidade Média"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>

        {/* Dialog: Registrar Conversão */}
        <Dialog
          open={showConversionDialog}
          onOpenChange={setShowConversionDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Conversão</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="lead">Lead *</Label>
                <Select
                  value={selectedLeadId?.toString() || ""}
                  onValueChange={v => setSelectedLeadId(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um lead" />
                  </SelectTrigger>
                  <SelectContent>
                    {allLeads?.map((lead: any) => (
                      <SelectItem key={lead.id} value={lead.id.toString()}>
                        {lead.nome || `Lead #${lead.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="won">Ganho</SelectItem>
                    <SelectItem value="lost">Perdido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="value">Valor do Negócio (R$)</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  value={dealValue}
                  onChange={e => setDealValue(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Detalhes sobre a conversão..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowConversionDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateConversion}
                disabled={createConversionMutation.isPending}
              >
                {createConversionMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Registrar Conversão
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
