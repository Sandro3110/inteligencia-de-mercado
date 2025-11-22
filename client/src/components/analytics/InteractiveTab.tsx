import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, MapPin, PieChart as PieChartIcon, RefreshCw } from "lucide-react";
import { CardSkeleton, ChartSkeleton } from "@/components/skeletons";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

interface InteractiveTabProps {
  projectId: number;
}

export function InteractiveTab({ projectId }: InteractiveTabProps) {
  const [months, setMonths] = useState(6);
  const [selectedPesquisaId, setSelectedPesquisaId] = useState<number | null>(null);

  // Buscar pesquisas do projeto selecionado
  const { data: pesquisas } = trpc.pesquisas.list.useQuery(
    undefined,
    { enabled: !!projectId }
  );

  const { data: evolutionData, refetch: refetchEvolution, isLoading: isLoadingEvolution } = trpc.analytics.evolution.useQuery(
    { projectId, pesquisaId: selectedPesquisaId ?? undefined, months },
    { enabled: !!projectId }
  );

  const { data: geographicData, refetch: refetchGeographic } = trpc.analytics.geographic.useQuery(
    { projectId, pesquisaId: selectedPesquisaId ?? undefined },
    { enabled: !!projectId }
  );

  const { data: segmentationData, refetch: refetchSegmentation, isLoading: isLoadingSegmentation } = trpc.analytics.segmentation.useQuery(
    { projectId, pesquisaId: selectedPesquisaId ?? undefined },
    { enabled: !!projectId }
  );

  const handleRefresh = () => {
    refetchEvolution();
    refetchGeographic();
    refetchSegmentation();
  };

  const isLoading = isLoadingEvolution || isLoadingSegmentation;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton count={3} showHeader={true} contentHeight="h-20" />
        </div>
        <ChartSkeleton type="bar" height="h-96" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton type="pie" />
          <ChartSkeleton type="area" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex items-center justify-end gap-4">
        <select
          value={selectedPesquisaId || ""}
          onChange={(e) => setSelectedPesquisaId(e.target.value ? Number(e.target.value) : null)}
          className="px-3 py-2 border border-slate-300 rounded-md text-slate-700 bg-white"
        >
          <option value="">Todas as Pesquisas</option>
          {pesquisas?.map((p: any) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
        <select
          value={months}
          onChange={(e) => setMonths(Number(e.target.value))}
          className="px-3 py-2 border border-slate-300 rounded-md text-slate-700 bg-white"
        >
          <option value={3}>Últimos 3 meses</option>
          <option value={6}>Últimos 6 meses</option>
          <option value={12}>Últimos 12 meses</option>
        </select>
        <Button onClick={handleRefresh} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </Button>
      </div>

      {/* Gráfico 1: Evolução Temporal (LineChart) */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-slate-900">Evolução Temporal</CardTitle>
          </div>
          <p className="text-sm text-slate-600 mt-1">Mercados, clientes e leads criados por mês</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={evolutionData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.5rem" }}
                labelStyle={{ color: "#0f172a" }}
              />
              <Legend />
              <Line type="monotone" dataKey="mercados" stroke="#3b82f6" strokeWidth={2} name="Mercados" />
              <Line type="monotone" dataKey="clientes" stroke="#10b981" strokeWidth={2} name="Clientes" />
              <Line type="monotone" dataKey="leads" stroke="#f59e0b" strokeWidth={2} name="Leads" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 2: Distribuição Geográfica (BarChart) */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              <CardTitle className="text-slate-900">Distribuição Geográfica</CardTitle>
            </div>
            <p className="text-sm text-slate-600 mt-1">Top 10 estados com mais registros</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={geographicData || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" />
                <YAxis dataKey="uf" type="category" stroke="#64748b" width={50} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.5rem" }}
                  labelStyle={{ color: "#0f172a" }}
                />
                <Bar dataKey="count" fill="#10b981" name="Registros" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico 3: Segmentação (PieChart) */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-purple-600" />
              <CardTitle className="text-slate-900">Segmentação de Mercado</CardTitle>
            </div>
            <p className="text-sm text-slate-600 mt-1">Distribuição B2B, B2C e Ambos</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={segmentationData || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ segmentacao, percent }) => `${segmentacao} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="segmentacao"
                >
                  {(segmentationData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.5rem" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Total de Meses</p>
                <p className="text-2xl font-bold text-blue-900">{evolutionData?.length || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Estados Ativos</p>
                <p className="text-2xl font-bold text-green-900">{geographicData?.length || 0}</p>
              </div>
              <MapPin className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium">Segmentos</p>
                <p className="text-2xl font-bold text-purple-900">{segmentationData?.length || 0}</p>
              </div>
              <PieChartIcon className="w-8 h-8 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
