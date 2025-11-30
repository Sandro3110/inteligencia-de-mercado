'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { ArrowLeft, Play, Pause, RotateCcw, Eye } from 'lucide-react';
import { ProgressBar } from '@/components/enrichment/ProgressBar';
import { PesquisaCard } from '@/components/dashboard/PesquisaCard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

export default function EnrichmentPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = parseInt(params.id as string);
  const surveyId = parseInt(params.surveyId as string);

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [jobId, setJobId] = useState<number | null>(null);

  const trpcUtils = trpc.useUtils();

  // Queries
  const { data: pesquisa, isLoading: loadingPesquisa } = trpc.pesquisas.getById.useQuery(surveyId);

  const { data: job, isLoading: loadingJob } = trpc.enrichment.getJob.useQuery(
    { pesquisaId: surveyId },
    {
      enabled: jobId !== null || pesquisa?.status === 'enriquecendo',
      refetchInterval: (data) => {
        // Poll every 2s while running
        if (data?.status === 'running') return 2000;
        return false;
      },
    }
  );

  // Mutations
  const startMutation = trpc.enrichment.start.useMutation({
    onSuccess: (data) => {
      setJobId(data.id);
      addLog('Enriquecimento iniciado com sucesso', 'success');
      trpcUtils.enrichment.getJob.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao iniciar: ${error.message}`);
      addLog(`Erro ao iniciar: ${error.message}`, 'error');
    },
  });

  const pauseMutation = trpc.enrichment.pause.useMutation({
    onSuccess: () => {
      addLog('Enriquecimento pausado', 'warning');
      trpcUtils.enrichment.getJob.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao pausar: ${error.message}`);
    },
  });

  const resumeMutation = trpc.enrichment.resume.useMutation({
    onSuccess: () => {
      addLog('Enriquecimento retomado', 'success');
      trpcUtils.enrichment.getJob.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao retomar: ${error.message}`);
    },
  });

  // Helper to add log
  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    setLogs((prev) => [
      ...prev,
      {
        timestamp: new Date().toISOString(),
        message,
        type,
      },
    ]);
  };

  // Update logs based on job status
  useEffect(() => {
    if (job) {
      if (job.status === 'completed') {
        addLog(`Enriquecimento concluído! ${job.successClientes} clientes processados`, 'success');
      } else if (job.status === 'failed') {
        addLog(`Enriquecimento falhou: ${job.errorMessage || 'Erro desconhecido'}`, 'error');
      }
    }
  }, [job?.status]);

  // Handlers
  const handleStart = () => {
    addLog('Iniciando enriquecimento...', 'info');
    startMutation.mutate({ pesquisaId: surveyId });
  };

  const handlePause = () => {
    if (!job) return;
    pauseMutation.mutate({ jobId: job.id });
  };

  const handleResume = () => {
    if (!job) return;
    addLog('Retomando enriquecimento...', 'info');
    resumeMutation.mutate({ jobId: job.id });
  };

  const handleViewResults = () => {
    router.push(`/projects/${projectId}/surveys/${surveyId}/results`);
  };

  if (loadingPesquisa) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-96 mb-8" />
        </div>
      </div>
    );
  }

  if (!pesquisa) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-lg font-medium text-gray-700">Pesquisa não encontrada</p>
        </div>
      </div>
    );
  }

  const isRunning = job?.status === 'running';
  const isPaused = job?.status === 'paused';
  const isCompleted = job?.status === 'completed';
  const isFailed = job?.status === 'failed';

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push(`/projects/${projectId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar para Projeto
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Enriquecimento com IA</h1>
        <p className="text-gray-600">Pesquisa: {pesquisa.nome}</p>
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-gray-600 mb-1">Total de Clientes</div>
            <div className="text-2xl font-bold text-gray-900">{pesquisa.totalClientes}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Enriquecidos</div>
            <div className="text-2xl font-bold text-green-600">{pesquisa.clientesEnriquecidos}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Restantes</div>
            <div className="text-2xl font-bold text-blue-600">
              {pesquisa.totalClientes - pesquisa.clientesEnriquecidos}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Status</div>
            <div className="text-lg font-semibold text-gray-900 capitalize">{pesquisa.status}</div>
          </div>
        </div>
      </div>

      {/* Progress Card */}
      {job && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Progresso</h2>
          <ProgressBar
            current={job.processedClientes}
            total={job.totalClientes}
            status={job.status as any}
          />
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex gap-4">
          {!job || job.status === 'pending' ? (
            <Button
              onClick={handleStart}
              disabled={startMutation.isPending || pesquisa.totalClientes === 0}
              className="flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Iniciar Enriquecimento
            </Button>
          ) : isRunning ? (
            <Button
              onClick={handlePause}
              disabled={pauseMutation.isPending}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Pause className="w-4 h-4" />
              Pausar
            </Button>
          ) : isPaused ? (
            <Button
              onClick={handleResume}
              disabled={resumeMutation.isPending}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Retomar
            </Button>
          ) : null}

          {(isCompleted || isFailed) && (
            <Button
              onClick={handleViewResults}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Ver Resultados
            </Button>
          )}
        </div>

        {pesquisa.totalClientes === 0 && (
          <p className="text-sm text-amber-600 mt-4">
            ⚠️ Esta pesquisa não tem clientes importados. Importe um CSV primeiro.
          </p>
        )}
      </div>

      {/* PesquisaCard */}
      {pesquisa && (
        <PesquisaCard
          pesquisa={pesquisa}
          onEnrich={() => {}}
          onGeocode={() => router.push(`/projects/${projectId}/surveys/${surveyId}/geocode`)}
          onViewResults={() => router.push(`/projects/${projectId}/surveys/${surveyId}/results`)}
          onExport={() => router.push(`/projects/${projectId}/surveys/${surveyId}/export`)}
          onRefresh={() => trpcUtils.pesquisas.getById.invalidate(surveyId)}
        />
      )}
    </div>
  );
}
