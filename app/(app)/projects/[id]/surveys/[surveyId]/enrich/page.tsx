'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { ArrowLeft, Play } from 'lucide-react';
import { PesquisaCard } from '@/components/dashboard/PesquisaCard';
import { Button } from '@/components/ui/button';

export default function EnrichmentPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = parseInt(params.id as string);
  const surveyId = parseInt(params.surveyId as string);

  const trpcUtils = trpc.useUtils();

  // Query usando pesquisas.getByIdWithCounts para buscar dados completos
  const { data: pesquisa, isLoading: loadingPesquisa } = trpc.pesquisas.getByIdWithCounts.useQuery(
    surveyId,
    {
      enabled: !!surveyId,
      refetchInterval: 5000, // Atualizar a cada 5s
    }
  );

  // Mutation para iniciar enriquecimento
  const startMutation = trpc.enrichment.start.useMutation({
    onSuccess: () => {
      trpcUtils.pesquisas.getByIdWithCounts.invalidate(surveyId);
      trpcUtils.dashboard.getProjects.invalidate();
    },
  });

  const handleStart = () => {
    startMutation.mutate({ pesquisaId: surveyId });
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

  const progressPercentage =
    pesquisa.totalClientes > 0
      ? Math.round((pesquisa.clientesEnriquecidos / pesquisa.totalClientes) * 100)
      : 0;

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

      {/* Card de Status e Controle */}
      <div className="bg-white rounded-lg shadow mb-6">
        {/* Métricas no Topo */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total de Clientes</div>
              <div className="text-2xl font-bold text-gray-900">{pesquisa.totalClientes}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Enriquecidos</div>
              <div className="text-2xl font-bold text-green-600">
                {pesquisa.clientesEnriquecidos}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Restantes</div>
              <div className="text-2xl font-bold text-blue-600">
                {pesquisa.totalClientes - pesquisa.clientesEnriquecidos}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Status</div>
              <div className="text-lg font-semibold text-gray-900 capitalize">
                {pesquisa.status}
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Progresso</h2>
          <div className="mb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                {pesquisa.clientesEnriquecidos} / {pesquisa.totalClientes} clientes
              </span>
              <span className="text-sm font-bold text-blue-600">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Processados:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {pesquisa.clientesEnriquecidos}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Restantes:</span>
              <span className="ml-2 font-semibold text-blue-600">
                {pesquisa.totalClientes - pesquisa.clientesEnriquecidos}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Total:</span>
              <span className="ml-2 font-semibold text-gray-900">{pesquisa.totalClientes}</span>
            </div>
          </div>
        </div>

        {/* Botão de Controle */}
        <div className="p-6">
          {pesquisa.clientesEnriquecidos === 0 && pesquisa.status !== 'enriquecendo' ? (
            <Button
              onClick={handleStart}
              disabled={startMutation.isPending || pesquisa.totalClientes === 0}
              className="flex items-center gap-2"
              size="lg"
            >
              <Play className="w-4 h-4" />
              {startMutation.isPending ? 'Iniciando...' : 'Iniciar Enriquecimento'}
            </Button>
          ) : (
            <div className="text-sm text-gray-600">
              {pesquisa.status === 'enriquecendo' && (
                <p className="text-blue-600 font-medium">
                  ⚡ Enriquecimento em andamento... Atualizando automaticamente.
                </p>
              )}
              {pesquisa.clientesEnriquecidos > 0 && pesquisa.status !== 'enriquecendo' && (
                <p className="text-green-600 font-medium">
                  ✓ Enriquecimento concluído! Use o card abaixo para outras ações.
                </p>
              )}
            </div>
          )}

          {pesquisa.totalClientes === 0 && (
            <p className="text-sm text-amber-600 mt-4">
              ⚠️ Esta pesquisa não tem clientes importados. Importe um CSV primeiro.
            </p>
          )}
        </div>
      </div>

      {/* PesquisaCard Compacto - Mesma largura da página de projetos */}
      <div className="max-w-2xl">
        {pesquisa && (
          <PesquisaCard
            pesquisa={pesquisa}
            onEnrich={() => router.push(`/projects/${projectId}/surveys/${surveyId}/enrich`)}
            onGeocode={() => router.push(`/projects/${projectId}/surveys/${surveyId}/geocode`)}
            onViewResults={() => router.push(`/projects/${projectId}/surveys/${surveyId}/results`)}
            onExport={() => router.push(`/projects/${projectId}/surveys/${surveyId}/export`)}
            onViewEnrichment={() =>
              router.push(`/projects/${projectId}/surveys/${surveyId}/enrich`)
            }
            onRefresh={() => {
              trpcUtils.pesquisas.getByIdWithCounts.invalidate(surveyId);
              trpcUtils.dashboard.getProjects.invalidate();
            }}
          />
        )}
      </div>
    </div>
  );
}
