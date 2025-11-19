import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, Pause, CheckCircle, XCircle, Clock, DollarSign, Users, Target, TrendingUp } from 'lucide-react';

export default function Enriquecimento() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({
    total: 0,
    processed: 0,
    success: 0,
    failed: 0,
    currentBatch: 0,
    totalBatches: 0,
    estimatedTimeRemaining: 0,
  });

  // Buscar estimativa de custo
  const { data: estimate } = trpc.enrichmentV2.estimateCost.useQuery({ numClientes: 801 });

  // Mutation para iniciar enriquecimento
  const enrichMutation = trpc.enrichmentV2.enrichBatch.useMutation({
    onSuccess: (data) => {
      setIsRunning(false);
      console.log('Enriquecimento concluído:', data);
    },
    onError: (error) => {
      setIsRunning(false);
      console.error('Erro no enriquecimento:', error);
    },
  });

  const handleStart = () => {
    setIsRunning(true);
    enrichMutation.mutate({
      projectId: 1,
      batchSize: 5,
      checkpointInterval: 50,
    });
  };

  const handlePause = () => {
    setIsRunning(false);
    // TODO: Implementar lógica de pausa
  };

  const progressPercent = progress.total > 0 
    ? Math.round((progress.processed / progress.total) * 100) 
    : 0;

  const successRate = progress.processed > 0
    ? Math.round((progress.success / progress.processed) * 100)
    : 0;

  const timeRemaining = progress.estimatedTimeRemaining > 0
    ? Math.round(progress.estimatedTimeRemaining / 1000 / 60)
    : 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Enriquecimento de Dados</h1>
            <p className="text-muted-foreground mt-1">
              Processamento em lote com Gemini LLM
            </p>
          </div>
          
          <div className="flex gap-3">
            {!isRunning ? (
              <Button onClick={handleStart} size="lg" disabled={enrichMutation.isPending}>
                <Play className="w-4 h-4 mr-2" />
                Iniciar Enriquecimento
              </Button>
            ) : (
              <Button onClick={handlePause} size="lg" variant="outline">
                <Pause className="w-4 h-4 mr-2" />
                Pausar
              </Button>
            )}
          </div>
        </div>

        {/* Estimativa */}
        {estimate && !isRunning && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <strong>Estimativa para 801 clientes:</strong> {estimate.estimatedTime} de processamento, 
              custo aproximado de {estimate.estimatedCost} ({estimate.tokensEstimated.toLocaleString()} tokens)
            </AlertDescription>
          </Alert>
        )}

        {/* Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progresso Geral</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressPercent}%</div>
              <p className="text-xs text-muted-foreground">
                {progress.processed} / {progress.total} clientes
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
                {progress.success} sucessos, {progress.failed} falhas
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
              <CardTitle className="text-sm font-medium">Custo Estimado</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estimate?.estimatedCost || '$0.00'}</div>
              <p className="text-xs text-muted-foreground">
                Gemini 1.5 Flash
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Status Atual */}
        {isRunning && (
          <Card>
            <CardHeader>
              <CardTitle>Status do Processamento</CardTitle>
              <CardDescription>
                Acompanhe o progresso em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Processando lote {progress.currentBatch} de {progress.totalBatches}</span>
                  <Badge variant="outline" className="animate-pulse">
                    Em andamento
                  </Badge>
                </div>
                
                <Progress value={progressPercent} className="h-2" />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Clientes processados:</span>
                    <span className="ml-2 font-medium">{progress.processed}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sucessos:</span>
                    <span className="ml-2 font-medium text-green-600">{progress.success}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Falhas:</span>
                    <span className="ml-2 font-medium text-red-600">{progress.failed}</span>
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
            <CardTitle>Sobre o Enriquecimento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <Target className="h-4 w-4 mt-0.5 text-blue-600" />
              <div>
                <strong>5 Etapas Sequenciais:</strong> Enriquecimento do Cliente → Identificação de Mercados → Criação de Produtos → Busca de Concorrentes → Busca de Leads
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 mt-0.5 text-green-600" />
              <div>
                <strong>Deduplicação Inteligente:</strong> Sistema reutiliza mercados, concorrentes e leads quando aplicável, evitando duplicação e otimizando custos
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 mt-0.5 text-purple-600" />
              <div>
                <strong>Validação de Dados:</strong> CNPJs são validados automaticamente, concorrentes não podem ser clientes, leads não podem ser clientes ou concorrentes
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
