import { useState, useEffect } from "react";
import { DynamicBreadcrumbs } from "@/components/DynamicBreadcrumbs";
import { useSelectedProject } from "@/hooks/useSelectedProject";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Activity,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  Loader2,
  PlayCircle,
  PauseCircle,
  RefreshCw,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface BatchMetrics {
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  avgProcessingTime: number;
  currentBatchSize: number;
  estimatedTimeRemaining: number;
}

interface CircuitBreakerStatus {
  state: "closed" | "open" | "half-open";
  failureCount: number;
  threshold: number;
  lastFailureTime?: Date;
}

export default function MonitoringDashboard() {
  const { selectedProjectId } = useSelectedProject();
  const [isPolling, setIsPolling] = useState(true);
  const [metricsHistory, setMetricsHistory] = useState<any[]>([]);

  // Buscar progresso do enriquecimento
  const { data: progress, refetch: refetchProgress } =
    trpc.enrichment.progress.useQuery(
      { projectId: selectedProjectId! },
      {
        enabled: !!selectedProjectId && isPolling,
        refetchInterval: isPolling ? 3000 : false, // Poll a cada 3 segundos
      }
    );

  // Buscar status do job
  const { data: jobStatus } = trpc.batchProcessor.status.useQuery(undefined, {
    enabled: !!selectedProjectId && isPolling,
    refetchInterval: isPolling ? 3000 : false,
  });

  // Mutations para controle
  const pauseMutation = trpc.batchProcessor.pause.useMutation();
  const resumeMutation = trpc.batchProcessor.resume.useMutation();

  // Simular métricas (você pode implementar endpoint real)
  const [metrics, setMetrics] = useState<BatchMetrics>({
    totalProcessed: 0,
    successCount: 0,
    errorCount: 0,
    avgProcessingTime: 0,
    currentBatchSize: 5,
    estimatedTimeRemaining: 0,
  });

  const [circuitBreaker, setCircuitBreaker] = useState<CircuitBreakerStatus>({
    state: "closed",
    failureCount: 0,
    threshold: 10,
  });

  // Atualizar métricas quando progresso mudar
  useEffect(() => {
    if (progress) {
      const newMetrics: BatchMetrics = {
        totalProcessed: progress.processed || 0,
        successCount: progress.processed || 0,
        errorCount: 0, // Você pode adicionar campo de erros no backend
        avgProcessingTime: 35, // Média em segundos
        currentBatchSize: 5,
        estimatedTimeRemaining:
          ((progress.total || 0) - (progress.processed || 0)) * 35,
      };
      setMetrics(newMetrics);

      // Adicionar ao histórico
      setMetricsHistory(prev => [
        ...prev.slice(-19), // Manter últimos 20 pontos
        {
          time: new Date().toLocaleTimeString(),
          processed: newMetrics.totalProcessed,
          success: newMetrics.successCount,
          errors: newMetrics.errorCount,
        },
      ]);

      // Simular circuit breaker (você pode implementar lógica real)
      const errorRate =
        newMetrics.errorCount / (newMetrics.totalProcessed || 1);
      if (errorRate > 0.1) {
        // 10% de erro
        setCircuitBreaker(prev => ({
          ...prev,
          failureCount: prev.failureCount + 1,
          state: prev.failureCount >= prev.threshold ? "open" : "closed",
          lastFailureTime: new Date(),
        }));
      }
    }
  }, [progress]);

  const handlePause = async () => {
    if (!selectedProjectId) {
      return;
    }
    try {
      await pauseMutation.mutateAsync();
      toast.success("Enriquecimento pausado");
      refetchProgress();
    } catch (error: any) {
      toast.error(`Erro ao pausar: ${error.message}`);
    }
  };

  const handleResume = async () => {
    if (!selectedProjectId) {
      return;
    }
    try {
      await resumeMutation.mutateAsync({
        pesquisaId: selectedProjectId,
        batchSize: 5,
      });
      toast.success("Enriquecimento retomado");
      refetchProgress();
    } catch (error: any) {
      toast.error(`Erro ao retomar: ${error.message}`);
    }
  };

  const getCircuitBreakerColor = () => {
    switch (circuitBreaker.state) {
      case "closed":
        return "text-green-600";
      case "open":
        return "text-red-600";
      case "half-open":
        return "text-yellow-600";
    }
  };

  const getCircuitBreakerIcon = () => {
    switch (circuitBreaker.state) {
      case "closed":
        return <CheckCircle2 className="w-5 h-5" />;
      case "open":
        return <XCircle className="w-5 h-5" />;
      case "half-open":
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  if (!selectedProjectId) {
    return (
      <div className="min-h-screen ml-60 bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <DynamicBreadcrumbs />
          </div>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Selecione um projeto para monitorar
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const progressPercentage = progress
    ? Math.round(((progress.processed || 0) / (progress.total || 1)) * 100)
    : 0;

  return (
    <div className="min-h-screen ml-60 bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <DynamicBreadcrumbs />
            <h1 className="text-3xl font-bold text-foreground mt-2">
              <Activity className="inline-block w-8 h-8 mr-2" />
              Monitoramento em Tempo Real
            </h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe o progresso do enriquecimento e métricas de performance
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPolling(!isPolling)}
            >
              {isPolling ? (
                <>
                  <PauseCircle className="w-4 h-4 mr-2" />
                  Pausar Polling
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Iniciar Polling
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Status Geral */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {jobStatus?.status === "running" ? (
                  <>
                    <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                    <span className="text-2xl font-bold text-green-600">
                      Ativo
                    </span>
                  </>
                ) : jobStatus?.status === "paused" ? (
                  <>
                    <PauseCircle className="w-5 h-5 text-yellow-600" />
                    <span className="text-2xl font-bold text-yellow-600">
                      Pausado
                    </span>
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5 text-slate-600" />
                    <span className="text-2xl font-bold text-slate-600">
                      Aguardando
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Progresso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-foreground">
                    {progressPercentage}%
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {progress?.processed || 0}/{progress?.total || 0}
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Sucesso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold text-foreground">
                  {metrics.totalProcessed > 0
                    ? Math.round(
                        (metrics.successCount / metrics.totalProcessed) * 100
                      )
                    : 0}
                  %
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.successCount} de {metrics.totalProcessed} processados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Circuit Breaker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`flex items-center gap-2 ${getCircuitBreakerColor()}`}
              >
                {getCircuitBreakerIcon()}
                <span className="text-2xl font-bold capitalize">
                  {circuitBreaker.state}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {circuitBreaker.failureCount}/{circuitBreaker.threshold} falhas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Métricas Detalhadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gráfico de Evolução */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução de Processamento</CardTitle>
              <CardDescription>Últimos 20 pontos de coleta</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={metricsHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="processed"
                    stroke="#3b82f6"
                    name="Processados"
                  />
                  <Line
                    type="monotone"
                    dataKey="errors"
                    stroke="#ef4444"
                    name="Erros"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Métricas de Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Performance</CardTitle>
              <CardDescription>Estatísticas em tempo real</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Tempo Médio
                  </span>
                </div>
                <span className="text-lg font-semibold">
                  {metrics.avgProcessingTime}s
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Batch Size
                  </span>
                </div>
                <span className="text-lg font-semibold">
                  {metrics.currentBatchSize} paralelos
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Tempo Restante
                  </span>
                </div>
                <span className="text-lg font-semibold">
                  {Math.round(metrics.estimatedTimeRemaining / 60)}min
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Taxa de Erro
                  </span>
                </div>
                <span className="text-lg font-semibold">
                  {metrics.totalProcessed > 0
                    ? (
                        (metrics.errorCount / metrics.totalProcessed) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controles */}
        <Card>
          <CardHeader>
            <CardTitle>Controles de Enriquecimento</CardTitle>
            <CardDescription>
              Pausar, retomar ou reiniciar o processo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button
                onClick={handlePause}
                disabled={
                  pauseMutation.isPending || jobStatus?.status !== "running"
                }
                variant="outline"
              >
                {pauseMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Pausando...
                  </>
                ) : (
                  <>
                    <PauseCircle className="w-4 h-4 mr-2" />
                    Pausar
                  </>
                )}
              </Button>

              <Button
                onClick={handleResume}
                disabled={
                  resumeMutation.isPending || jobStatus?.status === "running"
                }
                variant="default"
              >
                {resumeMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Retomando...
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Retomar
                  </>
                )}
              </Button>

              <Button onClick={() => refetchProgress()} variant="ghost">
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Alertas Ativos */}
        {circuitBreaker.state === "open" && (
          <Card className="border-red-500">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Circuit Breaker Aberto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                O circuit breaker foi ativado devido a{" "}
                {circuitBreaker.failureCount} falhas consecutivas. O sistema
                está temporariamente pausado para evitar sobrecarga.
              </p>
              <Button variant="destructive" size="sm" className="mt-4">
                Resetar Circuit Breaker
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
