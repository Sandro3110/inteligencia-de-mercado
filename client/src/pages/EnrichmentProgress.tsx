import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useSelectedProject } from "@/hooks/useSelectedProject";
import { Progress } from "@/components/ui/progress";
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
  RefreshCw,
  CheckCircle2,
  Clock,
  TrendingUp,
  Pause,
  Play,
  History,
  CalendarPlus,
} from "lucide-react";
import EvolutionCharts from "@/components/EvolutionCharts";
import HistoryFilters, { FilterState } from "@/components/HistoryFilters";
import { exportToCSV, exportToPDF } from "@/lib/exportHistory";
import { ScheduleEnrichment } from "@/components/ScheduleEnrichment";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DynamicBreadcrumbs } from "@/components/DynamicBreadcrumbs";
export default function EnrichmentProgress() {
  const { selectedProjectId } = useSelectedProject();
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: "",
    dateTo: "",
    status: "all",
    durationMin: "",
    durationMax: "",
  });
  const [filteredHistory, setFilteredHistory] = useState<any[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Query com polling automático a cada 5 segundos
  // Usa projectId selecionado ou 1 como fallback
  const projectId = selectedProjectId || 1;

  const {
    data: progress,
    isLoading,
    refetch,
  } = trpc.enrichment.progress.useQuery(
    { projectId },
    {
      refetchInterval: 5000, // Atualiza a cada 5 segundos
      refetchIntervalInBackground: true,
    }
  );

  // Query de status (para controles de pausa/retomada)
  const { data: status, refetch: refetchStatus } =
    trpc.enrichment.status.useQuery(
      { projectId },
      {
        enabled: !!projectId,
        refetchInterval: 5000,
        refetchIntervalInBackground: true,
      }
    );

  // Query de histórico
  const { data: history } = trpc.enrichment.history.useQuery(
    { projectId, limit: 5 },
    {
      enabled: !!projectId,
      refetchInterval: 10000,
    }
  );

  // Mutations de pausa/retomada
  const pauseMutation = trpc.enrichment.pause.useMutation({
    onSuccess: () => {
      refetchStatus();
      refetch();
    },
  });

  const resumeMutation = trpc.enrichment.resume.useMutation({
    onSuccess: () => {
      refetchStatus();
      refetch();
    },
  });

  // Atualizar timestamp quando dados mudam
  useEffect(() => {
    if (progress) {
      setLastUpdate(new Date());
    }
  }, [progress]);

  // Aplicar filtros ao histórico
  useEffect(() => {
    if (!history) {
      setFilteredHistory([]);
      return;
    }

    let filtered = [...history];

    // Filtro por data
    if (filters.dateFrom) {
      const dateFrom = new Date(filters.dateFrom);
      filtered = filtered.filter(run => new Date(run.startedAt) >= dateFrom);
    }
    if (filters.dateTo) {
      const dateTo = new Date(filters.dateTo);
      dateTo.setHours(23, 59, 59, 999); // Incluir o dia inteiro
      filtered = filtered.filter(run => new Date(run.startedAt) <= dateTo);
    }

    // Filtro por status
    if (filters.status !== "all") {
      filtered = filtered.filter(run => run.status === filters.status);
    }

    // Filtro por duração
    if (filters.durationMin) {
      const minSeconds = parseInt(filters.durationMin) * 60;
      filtered = filtered.filter(
        run => (run.durationSeconds || 0) >= minSeconds
      );
    }
    if (filters.durationMax) {
      const maxSeconds = parseInt(filters.durationMax) * 60;
      filtered = filtered.filter(
        run => (run.durationSeconds || 0) <= maxSeconds
      );
    }

    setFilteredHistory(filtered);
  }, [history, filters]);

  // Funções de exportação
  const handleExportCSV = () => {
    if (filteredHistory.length > 0) {
      exportToCSV(filteredHistory);
    }
  };

  const handleExportPDF = () => {
    if (filteredHistory.length > 0) {
      exportToPDF(filteredHistory);
    }
  };

  const handleManualRefresh = () => {
    refetch();
    setLastUpdate(new Date());
  };

  const formatTimeSince = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 10) return "agora mesmo";
    if (seconds < 60) return `há ${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `há ${minutes}min`;
  };

  if (isLoading || !progress) {
    return (
      <div className="min-h-screen ml-60 bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando progresso...</p>
        </div>
      </div>
    );
  }

  const isComplete = progress.percentage === 100;
  const isInProgress = progress.processed > 0 && progress.percentage < 100;

  return (
    <div className="min-h-screen ml-60 bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Progresso do Enriquecimento
            </h1>
            <p className="text-muted-foreground">
              Acompanhe em tempo real o processamento dos clientes
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleManualRefresh}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
            <Button
              onClick={() => setShowScheduleModal(true)}
              variant="outline"
              className="gap-2 border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            >
              <CalendarPlus className="w-4 h-4" />
              Agendar
            </Button>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3">
          {isComplete && (
            <Badge variant="default" className="gap-2 px-4 py-2 text-base">
              <CheckCircle2 className="w-5 h-5" />
              Enriquecimento Concluído
            </Badge>
          )}
          {isInProgress && (
            <Badge variant="secondary" className="gap-2 px-4 py-2 text-base">
              <Clock className="w-5 h-5 animate-pulse" />
              Processando...
            </Badge>
          )}
          {!isInProgress && !isComplete && (
            <Badge variant="outline" className="gap-2 px-4 py-2 text-base">
              <Clock className="w-5 h-5" />
              Aguardando Início
            </Badge>
          )}

          {/* Botões de Controle */}
          {status?.activeRun && (
            <div className="flex gap-2">
              {status.canPause && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    pauseMutation.mutate({
                      projectId,
                      runId: status.activeRun!.id,
                    })
                  }
                  disabled={pauseMutation.isPending}
                  className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pausar
                </Button>
              )}
              {status.canResume && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    resumeMutation.mutate({
                      projectId,
                      runId: status.activeRun!.id,
                    })
                  }
                  disabled={resumeMutation.isPending}
                  className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Retomar
                </Button>
              )}
            </div>
          )}

          <span className="text-sm text-muted-foreground">
            Atualizado {formatTimeSince(lastUpdate)}
          </span>
        </div>

        {/* Progresso Principal */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Progresso Geral</CardTitle>
              <Badge variant="outline" className="text-2xl font-bold px-4 py-2">
                {progress.percentage}%
              </Badge>
            </div>
            <CardDescription className="text-base">
              {progress.processed} de {progress.total} clientes processados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Barra de Progresso */}
            <div className="space-y-2">
              <Progress value={progress.percentage} className="h-4" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Processados: {progress.processed}</span>
                <span>Restantes: {progress.remaining}</span>
              </div>
            </div>

            {/* Contador Online */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500">
                  {progress.processed}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Processados
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-500">
                  {progress.remaining}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Restantes
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500">
                  {progress.total}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas Detalhadas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mercados */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                Mercados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-500">
                {progress.stats.mercados}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Mercados identificados
              </p>
            </CardContent>
          </Card>

          {/* Concorrentes */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                Concorrentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-orange-500">
                {progress.stats.concorrentes}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Concorrentes encontrados
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Média:{" "}
                {progress.processed > 0
                  ? Math.round(progress.stats.concorrentes / progress.processed)
                  : 0}{" "}
                por cliente
              </p>
            </CardContent>
          </Card>

          {/* Leads */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-500">
                {progress.stats.leads}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Leads gerados
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Média:{" "}
                {progress.processed > 0
                  ? Math.round(progress.stats.leads / progress.processed)
                  : 0}{" "}
                por cliente
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos de Evolução */}
        {status?.activeRun && (
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <CardTitle>Gráficos de Evolução</CardTitle>
              </div>
              <CardDescription>
                Visualize o progresso do enriquecimento ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EvolutionCharts runId={status.activeRun.id} />
            </CardContent>
          </Card>
        )}

        {/* Filtros do Histórico */}
        {history && history.length > 0 && (
          <HistoryFilters
            onFilterChange={setFilters}
            onExportCSV={handleExportCSV}
            onExportPDF={handleExportPDF}
          />
        )}

        {/* Histórico de Execuções */}
        {filteredHistory && filteredHistory.length > 0 && (
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-purple-400" />
                <CardTitle>Histórico de Execuções</CardTitle>
              </div>
              <CardDescription>
                Ultimas 5 execuções do enriquecimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredHistory.map(run => {
                  const duration = run.durationSeconds
                    ? Math.floor(run.durationSeconds / 60)
                    : 0;
                  const statusColor = (
                    {
                      completed: "text-green-400",
                      running: "text-blue-400",
                      paused: "text-yellow-400",
                      error: "text-red-400",
                    } as Record<string, string>
                  )[run.status];

                  return (
                    <div
                      key={run.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-sm font-medium ${statusColor}`}
                          >
                            {run.status === "completed" && "✅ Concluído"}
                            {run.status === "running" && "⏳ Em Execução"}
                            {run.status === "paused" && "⏸️ Pausado"}
                            {run.status === "error" && "❌ Erro"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(run.startedAt).toLocaleString("pt-BR")}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {run.processedClients}/{run.totalClients} clientes
                          {duration > 0 && ` • ${duration} minutos`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informações Adicionais */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Informações do Processamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-foreground">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium">
                {isComplete
                  ? "Concluído"
                  : isInProgress
                    ? "Em Progresso"
                    : "Aguardando"}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">
                Atualização automática:
              </span>
              <span className="font-medium">A cada 5 segundos</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Última atualização:</span>
              <span className="font-medium">
                {lastUpdate.toLocaleTimeString("pt-BR")}
              </span>
            </div>
            {isInProgress && progress.remaining > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Tempo estimado:</span>
                <span className="font-medium">
                  {Math.round((progress.remaining * 30) / 60)} minutos
                  <span className="text-xs text-muted-foreground ml-1">
                    (~30s por cliente)
                  </span>
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Agendamento */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl text-foreground">
              Agendamento de Enriquecimento
            </DialogTitle>
          </DialogHeader>
          <ScheduleEnrichment
            projectId={projectId}
            onClose={() => setShowScheduleModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
