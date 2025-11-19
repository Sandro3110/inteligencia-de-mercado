import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { useSelectedProject } from '@/hooks/useSelectedProject';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Zap, Clock as ClockIcon, Settings } from 'lucide-react';

export function QueueModeSelector() {
  const { selectedProjectId } = useSelectedProject();
  const [mode, setMode] = useState<'parallel' | 'sequential'>('sequential');
  const [maxJobs, setMaxJobs] = useState(3);

  // Buscar configuração atual do projeto
  const { data: projects } = trpc.projects.list.useQuery();
  const project = projects?.find(p => p.id === selectedProjectId);

  // Buscar status da fila
  const { data: queueStatus } = trpc.queue.status.useQuery(
    { projectId: selectedProjectId! },
    { enabled: !!selectedProjectId, refetchInterval: 5000 } // Atualizar a cada 5s
  );
  
  // Buscar ETA
  const { data: eta } = trpc.queue.eta.useQuery(
    { projectId: selectedProjectId! },
    { enabled: !!selectedProjectId && (queueStatus?.pending || 0) > 0, refetchInterval: 10000 }
  );

  // Mutation para atualizar modo
  const setModeMutation = trpc.queue.setMode.useMutation({
    onSuccess: () => {
      toast.success('Modo de execução atualizado!');
    },
    onError: () => {
      toast.error('Erro ao atualizar modo de execução');
    },
  });

  // Sincronizar com dados do projeto
  useEffect(() => {
    if (project) {
      setMode((project.executionMode as any) || 'sequential');
      setMaxJobs((project.maxParallelJobs as any) || 3);
    }
  }, [project]);

  const handleSave = () => {
    if (!selectedProjectId) return;

    setModeMutation.mutate({
      projectId: selectedProjectId,
      mode,
      maxParallelJobs: maxJobs,
    });
  };

  if (!selectedProjectId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Modo de Execução</CardTitle>
          <CardDescription>Selecione um projeto para configurar</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Modo de Execução da Fila
        </CardTitle>
        <CardDescription>
          Configure como os enriquecimentos serão processados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status da Fila */}
        {queueStatus && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">
                {queueStatus.pending || 0}
              </div>
              <div className="text-xs text-muted-foreground">Pendentes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {queueStatus.processing || 0}
              </div>
              <div className="text-xs text-muted-foreground">Processando</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {queueStatus.completed || 0}
              </div>
              <div className="text-xs text-muted-foreground">Concluídos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">
                {queueStatus.error || 0}
              </div>
              <div className="text-xs text-muted-foreground">Erros</div>
            </div>
          </div>
          
          {/* ETA (Estimativa de Tempo) */}
          {eta && eta.etaSeconds > 0 && (
            <div className="p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Tempo Estimado:</span>
                </div>
                <div className="text-sm font-bold">
                  {eta.etaSeconds < 60 
                    ? `${eta.etaSeconds}s`
                    : `${Math.floor(eta.etaSeconds / 60)}m ${eta.etaSeconds % 60}s`
                  }
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Baseado em média de {Math.round(eta.avgDurationMs / 1000)}s por job
              </p>
            </div>
          )}
          </div>
        )}

        {/* Seletor de Modo */}
        <div className="space-y-3">
          <Label>Modo de Processamento</Label>
          <RadioGroup value={mode} onValueChange={(v) => setMode(v as any)}>
            <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="parallel" id="parallel" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="parallel" className="flex items-center gap-2 cursor-pointer">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span className="font-semibold">Simultâneo (Paralelo)</span>
                  <Badge variant="secondary" className="ml-2">Rápido</Badge>
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Processa múltiplos enriquecimentos ao mesmo tempo. Ideal para grandes volumes.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="sequential" id="sequential" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="sequential" className="flex items-center gap-2 cursor-pointer">
                  <ClockIcon className="h-4 w-4 text-green-500" />
                  <span className="font-semibold">Fila (Sequencial)</span>
                  <Badge variant="secondary" className="ml-2">Estável</Badge>
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Processa um enriquecimento por vez. Mais controlado e previsível.
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Configuração de Jobs Paralelos */}
        {mode === 'parallel' && (
          <div className="space-y-2">
            <Label htmlFor="maxJobs">
              Máximo de Jobs Simultâneos
            </Label>
            <Input
              id="maxJobs"
              type="number"
              min={1}
              max={10}
              value={maxJobs}
              onChange={(e) => setMaxJobs(parseInt(e.target.value, 10))}
              className="w-32"
            />
            <p className="text-xs text-muted-foreground">
              Recomendado: 3-5 jobs para melhor performance
            </p>
          </div>
        )}

        {/* Botão Salvar */}
        <Button
          onClick={handleSave}
          disabled={setModeMutation.isPending}
          className="w-full"
        >
          {setModeMutation.isPending ? 'Salvando...' : 'Salvar Configuração'}
        </Button>
      </CardContent>
    </Card>
  );
}
