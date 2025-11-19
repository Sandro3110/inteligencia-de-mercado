import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useSelectedProject } from "@/hooks/useSelectedProject";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, Clock, TrendingUp } from "lucide-react";

export default function EnrichmentProgress() {
  const { selectedProjectId } = useSelectedProject();
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Query com polling automático a cada 5 segundos
  // Usa projectId selecionado ou 1 como fallback
  const projectId = selectedProjectId || 1;
  
  const { data: progress, isLoading, refetch } = trpc.enrichment.progress.useQuery(
    { projectId },
    {
      refetchInterval: 5000, // Atualiza a cada 5 segundos
      refetchIntervalInBackground: true,
    }
  );

  // Atualizar timestamp quando dados mudam
  useEffect(() => {
    if (progress) {
      setLastUpdate(new Date());
    }
  }, [progress]);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Carregando progresso...</p>
        </div>
      </div>
    );
  }

  const isComplete = progress.percentage === 100;
  const isInProgress = progress.processed > 0 && progress.percentage < 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Progresso do Enriquecimento
            </h1>
            <p className="text-slate-400">
              Acompanhe em tempo real o processamento dos clientes
            </p>
          </div>
          <Button
            onClick={handleManualRefresh}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
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
          <span className="text-sm text-slate-500">
            Atualizado {formatTimeSince(lastUpdate)}
          </span>
        </div>

        {/* Progresso Principal */}
        <Card className="glass-card">
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
              <div className="flex justify-between text-sm text-slate-400">
                <span>Processados: {progress.processed}</span>
                <span>Restantes: {progress.remaining}</span>
              </div>
            </div>

            {/* Contador Online */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500">
                  {progress.processed}
                </div>
                <div className="text-sm text-slate-400 mt-1">Processados</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-500">
                  {progress.remaining}
                </div>
                <div className="text-sm text-slate-400 mt-1">Restantes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500">
                  {progress.total}
                </div>
                <div className="text-sm text-slate-400 mt-1">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas Detalhadas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mercados */}
          <Card className="glass-card">
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
              <p className="text-sm text-slate-400 mt-2">
                Mercados identificados
              </p>
            </CardContent>
          </Card>

          {/* Concorrentes */}
          <Card className="glass-card">
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
              <p className="text-sm text-slate-400 mt-2">
                Concorrentes encontrados
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Média: {progress.processed > 0 
                  ? Math.round(progress.stats.concorrentes / progress.processed) 
                  : 0} por cliente
              </p>
            </CardContent>
          </Card>

          {/* Leads */}
          <Card className="glass-card">
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
              <p className="text-sm text-slate-400 mt-2">
                Leads gerados
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Média: {progress.processed > 0 
                  ? Math.round(progress.stats.leads / progress.processed) 
                  : 0} por cliente
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Informações Adicionais */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Informações do Processamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            <div className="flex justify-between py-2 border-b border-slate-700">
              <span className="text-slate-400">Status:</span>
              <span className="font-medium">
                {isComplete ? "Concluído" : isInProgress ? "Em Progresso" : "Aguardando"}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-700">
              <span className="text-slate-400">Atualização automática:</span>
              <span className="font-medium">A cada 5 segundos</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-700">
              <span className="text-slate-400">Última atualização:</span>
              <span className="font-medium">{lastUpdate.toLocaleTimeString('pt-BR')}</span>
            </div>
            {isInProgress && progress.remaining > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Tempo estimado:</span>
                <span className="font-medium">
                  {Math.round((progress.remaining * 30) / 60)} minutos
                  <span className="text-xs text-slate-500 ml-1">(~30s por cliente)</span>
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
