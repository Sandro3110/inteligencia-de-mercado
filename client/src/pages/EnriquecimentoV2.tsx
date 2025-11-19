import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, Pause, StopCircle, CheckCircle, XCircle, Clock, DollarSign, Users, Target, TrendingUp, RefreshCw } from 'lucide-react';

export default function EnriquecimentoV2() {
  const [currentJobId, setCurrentJobId] = useState<number | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // Buscar estimativa de custo
  const { data: estimate } = trpc.enrichmentV2.estimateCost.useQuery({ numClientes: 801 });

  // Buscar jobs do projeto
  const { data: jobs, refetch: refetchJobs } = trpc.enrichmentV2.listJobs.useQuery({ projectId: 1 });

  // Buscar progresso do job atual
  const { data: progress, refetch: refetchProgress } = trpc.enrichmentV2.getJobProgress.useQuery(
    { jobId: currentJobId! },
    { enabled: currentJobId !== null, refetchInterval: isPolling ? 3000 : false }
  );

  // Mutations
  const createJobMutation = trpc.enrichmentV2.createJob.useMutation({
    onSuccess: (jobId) => {
      setCurrentJobId(jobId);
      refetchJobs();
    },
  });

  const startJobMutation = trpc.enrichmentV2.startJob.useMutation({
    onSuccess: () => {
      setIsPolling(true);
      refetchProgress();
    },
  });

  const pauseJobMutation = trpc.enrichmentV2.pauseJob.useMutation({
    onSuccess: () => {
      setIsPolling(false);
      refetchProgress();
    },
  });

  const cancelJobMutation = trpc.enrichmentV2.cancelJob.useMutation({
    onSuccess: () => {
      setIsPolling(false);
      setCurrentJobId(null);
      refetchJobs();
    },
  });

  // Auto-parar polling quando job termina
  useEffect(() => {
    if (progress && (progress.status === 'completed' || progress.status === 'failed')) {
      setIsPolling(false);
    }
  }, [progress]);

  const handleCreateAndStart = async () => {
    const jobId = await createJobMutation.mutateAsync({
      projectId: 1,
      batchSize: 5,
      checkpointInterval: 50,
    });
    
    setCurrentJobId(jobId);
    
    // Aguardar um pouco para o job ser criado
    setTimeout(() => {
      startJobMutation.mutate({ jobId });
    }, 500);
  };

  const handleStart = () => {
    if (currentJobId) {
      startJobMutation.mutate({ jobId: currentJobId });
    }
  };

  const handlePause = () => {
    if (currentJobId) {
      pauseJobMutation.mutate({ jobId: currentJobId });
    }
  };

  const handleCancel = () => {
    if (currentJobId && confirm('Tem certeza que deseja cancelar o enriquecimento?')) {
      cancelJobMutation.mutate({ jobId: currentJobId });
    }
  };

  const progressPercent = progress?.percentComplete || 0;
  const successRate = progress && progress.processedClientes > 0
    ? Math.round((progress.successClientes / progress.processedClientes) * 100)
    : 0;
  const timeRemaining = progress?.estimatedTimeRemaining
    ? Math.round(progress.estimatedTimeRemaining / 1000 / 60)
    : 0;

  const isRunning = progress?.status === 'running';
  const isPaused = progress?.status === 'paused';
  const isCompleted = progress?.status === 'completed';
  const isFailed = progress?.status === 'failed';

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Enriquecimento de Dados V2</h1>
            <p className="text-muted-foreground mt-1">
              Sistema com pausa/retomar e processamento paralelo
            </p>
          </div>
          
          <div className="flex gap-3">
            {!currentJobId || isCompleted || isFailed ? (
              <Button 
                onClick={handleCreateAndStart} 
                size="lg" 
                disabled={createJobMutation.isPending || startJobMutation.isPending}
              >
                <Play className="w-4 h-4 mr-2" />
                Novo Enriquecimento
              </Button>
            ) : isPaused ? (
              <>
                <Button onClick={handleStart} size="lg" disabled={startJobMutation.isPending}>
                  <Play className="w-4 h-4 mr-2" />
                  Retomar
                </Button>
                <Button onClick={handleCancel} size="lg" variant="destructive" disabled={cancelJobMutation.isPending}>
                  <StopCircle className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </>
            ) : isRunning ? (
              <>
                <Button onClick={handlePause} size="lg" variant="outline" disabled={pauseJobMutation.isPending}>
                  <Pause className="w-4 h-4 mr-2" />
                  Pausar
                </Button>
                <Button onClick={handleCancel} size="lg" variant="destructive" disabled={cancelJobMutation.isPending}>
                  <StopCircle className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </>
            ) : null}
            
            <Button onClick={() => refetchProgress()} size="lg" variant="ghost">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Estimativa */}
        {estimate && !isRunning && !isPaused && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <strong>Estimativa para 801 clientes:</strong> {estimate.estimatedTime} de processamento, 
              custo aproximado de {estimate.estimatedCost} ({estimate.tokensEstimated.toLocaleString()} tokens)
            </AlertDescription>
          </Alert>
        )}

        {/* Progress Cards */}
        {progress && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Progresso Geral</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{progressPercent}%</div>
                <p className="text-xs text-muted-foreground">
                  {progress.processedClientes} / {progress.totalClientes} clientes
                </p>
                <Progress value={progressPercent} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{successRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {progress.successClientes} sucessos, {progress.failedClientes} falhas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Restante</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{timeRemaining} min</div>
                <p className="text-xs text-muted-foreground">
                  Lote {progress.currentBatch} de {progress.totalBatches}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                {isRunning && <Play className="h-4 w-4 text-green-600 animate-pulse" />}
                {isPaused && <Pause className="h-4 w-4 text-orange-600" />}
                {isCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
                {isFailed && <XCircle className="h-4 w-4 text-red-600" />}
              </CardHeader>
              <CardContent>
                <Badge 
                  variant={isRunning ? "default" : isPaused ? "secondary" : isCompleted ? "outline" : "destructive"}
                  className={isRunning ? "animate-pulse" : ""}
                >
                  {progress.status === 'running' && 'Em execução'}
                  {progress.status === 'paused' && 'Pausado'}
                  {progress.status === 'completed' && 'Concluído'}
                  {progress.status === 'failed' && 'Falhou'}
                  {progress.status === 'pending' && 'Pendente'}
                </Badge>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Status Atual */}
        {progress && (isRunning || isPaused) && (
          <Card>
            <CardHeader>
              <CardTitle>Status do Processamento</CardTitle>
              <CardDescription>
                {isRunning ? 'Acompanhe o progresso em tempo real' : 'Processamento pausado - clique em Retomar para continuar'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {isRunning ? `Processando lote ${progress.currentBatch} de ${progress.totalBatches}` : 'Pausado'}
                  </span>
                  <Badge variant="outline" className={isRunning ? "animate-pulse" : ""}>
                    {isRunning ? 'Em andamento' : 'Pausado'}
                  </Badge>
                </div>
                
                <Progress value={progressPercent} className="h-2" />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Clientes processados:</span>
                    <span className="ml-2 font-medium">{progress.processedClientes}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sucessos:</span>
                    <span className="ml-2 font-medium text-green-600">{progress.successClientes}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Falhas:</span>
                    <span className="ml-2 font-medium text-red-600">{progress.failedClientes}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tempo restante:</span>
                    <span className="ml-2 font-medium">{timeRemaining} minutos</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Histórico de Jobs */}
        {jobs && jobs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Enriquecimentos</CardTitle>
              <CardDescription>
                Últimos jobs executados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {jobs.slice(-5).reverse().map((job) => (
                  <div key={job.jobId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <Badge 
                          variant={
                            job.status === 'completed' ? 'outline' : 
                            job.status === 'running' ? 'default' : 
                            job.status === 'paused' ? 'secondary' : 
                            'destructive'
                          }
                        >
                          {job.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Job #{job.jobId}</p>
                        <p className="text-xs text-muted-foreground">
                          {job.processedClientes}/{job.totalClientes} clientes ({job.percentComplete}%)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {job.status === 'paused' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setCurrentJobId(job.jobId);
                            setTimeout(() => startJobMutation.mutate({ jobId: job.jobId }), 100);
                          }}
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Retomar
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setCurrentJobId(job.jobId)}
                      >
                        Ver detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Configurações */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações do Enriquecimento</CardTitle>
            <CardDescription>
              Parâmetros do processamento em lote
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium mb-2">Paralelização</h4>
                <p className="text-2xl font-bold text-blue-600">5 clientes</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Processamento simultâneo
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Checkpoint</h4>
                <p className="text-2xl font-bold text-purple-600">A cada 50</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Salvamento automático
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Por Cliente</h4>
                <p className="text-2xl font-bold text-orange-600">10 + 5</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Concorrentes + Leads
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações */}
        <Card>
          <CardHeader>
            <CardTitle>Sobre o Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <Target className="h-4 w-4 mt-0.5 text-blue-600" />
              <div>
                <strong>Processamento Persistente:</strong> O sistema salva o progresso automaticamente. Você pode pausar e retomar a qualquer momento sem perder dados.
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 mt-0.5 text-green-600" />
              <div>
                <strong>Checkpoint Automático:</strong> A cada 50 clientes processados, o sistema salva um checkpoint e envia notificação ao proprietário.
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 text-purple-600" />
              <div>
                <strong>Validação Completa:</strong> CNPJs validados, concorrentes não podem ser clientes, leads não podem ser clientes ou concorrentes.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
