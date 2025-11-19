import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useSelectedProject } from "@/hooks/useSelectedProject";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Clock, TrendingUp, Database, Activity } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function EnrichmentEvolution() {
  const { selectedProjectId } = useSelectedProject();

  const { data: evolution, isLoading: loadingEvolution } = trpc.enrichment.evolution.useQuery(
    { projectId: selectedProjectId!, days: 30 },
    { enabled: !!selectedProjectId, refetchInterval: 10000 }
  );

  const { data: predictions, isLoading: loadingPredictions } = trpc.enrichment.predictions.useQuery(
    { projectId: selectedProjectId! },
    { enabled: !!selectedProjectId, refetchInterval: 10000 }
  );

  if (loadingEvolution || loadingPredictions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!evolution || !predictions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs items={[{ label: "Evolução do Enriquecimento" }]} />
          <div className="text-center text-slate-400 mt-12">
            Nenhum dado de evolução disponível
          </div>
        </div>
      </div>
    );
  }

  // Preparar dados para o gráfico
  const chartData = evolution.map((run: any) => ({
    date: format(new Date(run.startedAt), "dd/MM", { locale: ptBR }),
    processados: run.processedClients,
    total: run.totalClients,
  }));

  const formatETA = (eta: string | null) => {
    if (!eta) return "N/A";
    const date = new Date(eta);
    return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  const formatDuration = (eta: string | null) => {
    if (!eta) return "N/A";
    const now = new Date();
    const target = new Date(eta);
    const diff = target.getTime() - now.getTime();
    
    if (diff < 0) return "Concluído";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={[{ label: "Evolução do Enriquecimento" }]} />

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Evolução do Enriquecimento</h1>
          <p className="text-slate-600 mt-1">Acompanhe o progresso e previsões do enriquecimento de dados</p>
        </div>

        {/* Cards de Previsão */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* ETA */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Previsão de Término
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {formatETA(predictions.eta ? predictions.eta.toString() : null)}
              </div>
              <div className="text-sm text-slate-500 mt-1">
                {formatDuration(predictions.eta ? predictions.eta.toString() : null)}
              </div>
            </CardContent>
          </Card>

          {/* Taxa de Processamento */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Taxa de Processamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {predictions.processingRate.toFixed(1)}
              </div>
              <div className="text-sm text-slate-500 mt-1">
                registros/hora
              </div>
            </CardContent>
          </Card>

          {/* Totais Atuais */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Totais Atuais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {predictions.currentTotals ? (predictions.currentTotals.clientes + predictions.currentTotals.concorrentes + predictions.currentTotals.leads) : 0}
              </div>
              <div className="text-sm text-slate-500 mt-1">
                registros no banco
              </div>
            </CardContent>
          </Card>

          {/* Estimativa Final */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Estimativa Final
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {predictions.estimatedTotals ? (predictions.estimatedTotals.clientes + predictions.estimatedTotals.concorrentes + predictions.estimatedTotals.leads) : 0}
              </div>
              <div className="text-sm text-slate-500 mt-1">
                registros estimados
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Evolução */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900">Evolução Temporal (Últimos 30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: "#1e293b", 
                    border: "1px solid #334155",
                    borderRadius: "8px"
                  }}
                  labelStyle={{ color: "#f1f5f9" }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="processados" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Processados"
                  dot={{ fill: "#3b82f6", r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Total"
                  dot={{ fill: "#10b981", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detalhamento de Totais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Totais Atuais Detalhados */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Totais Atuais Detalhados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-slate-700 font-medium">Clientes</span>
                  <span className="text-xl font-bold text-blue-600">{predictions.currentTotals?.clientes || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-slate-700 font-medium">Concorrentes</span>
                  <span className="text-xl font-bold text-purple-600">{predictions.currentTotals?.concorrentes || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-slate-700 font-medium">Leads</span>
                  <span className="text-xl font-bold text-orange-600">{predictions.currentTotals?.leads || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-slate-700 font-medium">Mercados</span>
                  <span className="text-xl font-bold text-green-600">{predictions.currentTotals?.mercados || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estimativas Finais Detalhadas */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Estimativas Finais Detalhadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-slate-700 font-medium">Clientes</span>
                  <span className="text-xl font-bold text-blue-600">{predictions.estimatedTotals?.clientes || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-slate-700 font-medium">Concorrentes</span>
                  <span className="text-xl font-bold text-purple-600">{predictions.estimatedTotals?.concorrentes || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-slate-700 font-medium">Leads</span>
                  <span className="text-xl font-bold text-orange-600">{predictions.estimatedTotals?.leads || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-slate-700 font-medium">Mercados</span>
                  <span className="text-xl font-bold text-green-600">{predictions.estimatedTotals?.mercados || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
