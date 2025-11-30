'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { ArrowLeft } from 'lucide-react';
import { PesquisaCard } from '@/components/dashboard/PesquisaCard';

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

  const trpcUtils = trpc.useUtils();

  // Queries
  const { data: pesquisa, isLoading: loadingPesquisa } = trpc.pesquisas.getById.useQuery(surveyId);

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

      {/* PesquisaCard */}
      {pesquisa && (
        <PesquisaCard
          pesquisa={pesquisa}
          onEnrich={() => router.push(`/projects/${projectId}/surveys/${surveyId}/enrich`)}
          onGeocode={() => router.push(`/projects/${projectId}/surveys/${surveyId}/geocode`)}
          onViewResults={() => router.push(`/projects/${projectId}/surveys/${surveyId}/results`)}
          onExport={() => router.push(`/projects/${projectId}/surveys/${surveyId}/export`)}
          onViewEnrichment={() => router.push(`/projects/${projectId}/surveys/${surveyId}/enrich`)}
          onRefresh={() => trpcUtils.pesquisas.getById.invalidate(surveyId)}
        />
      )}
    </div>
  );
}
