'use client';

import { useProject } from '@/lib/contexts/ProjectContext';
import { trpc } from '@/lib/trpc/client';
import { Building2, Search, Globe, Users, TrendingUp, Target } from 'lucide-react';
import dynamic from 'next/dynamic';

// Lazy load charts para melhor performance
const EvolutionCharts = dynamic(() => import('@/components/EvolutionCharts'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-lg shadow p-12 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="text-gray-600 mt-4">Carregando gráficos...</p>
    </div>
  ),
});

export default function DashboardPage() {
  const { selectedProjectId } = useProject();
  
  // Buscar estatísticas usando router existente
  const { data: stats, isLoading: loadingStats, error } = trpc.dashboard.stats.useQuery(
    selectedProjectId ? { projectId: selectedProjectId } : undefined,
    {
      retry: 1,
      refetchOnWindowFocus: false,
    }
  );

  // Log para debug
  if (error) {
    console.error('Dashboard stats error:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          {selectedProjectId 
            ? 'Visão geral do projeto selecionado'
            : 'Visão geral de todos os projetos'}
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Projetos */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Projetos</h3>
            <Building2 className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {loadingStats ? (
              <span className="animate-pulse">-</span>
            ) : (
              (stats as any)?.projects || 0
            )}
          </p>
          <p className="text-xs text-gray-500 mt-2">Total de projetos no sistema</p>
        </div>

        {/* Pesquisas */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Pesquisas</h3>
            <Search className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {loadingStats ? (
              <span className="animate-pulse">-</span>
            ) : (
              (stats as any)?.pesquisas || 0
            )}
          </p>
          <p className="text-xs text-gray-500 mt-2">Pesquisas realizadas</p>
        </div>

        {/* Mercados */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Mercados</h3>
            <Globe className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {loadingStats ? (
              <span className="animate-pulse">-</span>
            ) : (
              (stats as any)?.mercados || 0
            )}
          </p>
          <p className="text-xs text-gray-500 mt-2">Mercados mapeados</p>
        </div>

        {/* Leads */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Leads</h3>
            <Users className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {loadingStats ? (
              <span className="animate-pulse">-</span>
            ) : (
              (stats as any)?.leads || 0
            )}
          </p>
          <p className="text-xs text-gray-500 mt-2">Leads capturados</p>
        </div>

        {/* Clientes */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Clientes</h3>
            <Target className="w-8 h-8 text-cyan-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {loadingStats ? (
              <span className="animate-pulse">-</span>
            ) : (
              (stats as any)?.clientes || 0
            )}
          </p>
          <p className="text-xs text-gray-500 mt-2">Clientes identificados</p>
        </div>

        {/* Concorrentes */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Concorrentes</h3>
            <TrendingUp className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {loadingStats ? (
              <span className="animate-pulse">-</span>
            ) : (
              (stats as any)?.concorrentes || 0
            )}
          </p>
          <p className="text-xs text-gray-500 mt-2">Concorrentes mapeados</p>
        </div>
      </div>

      {/* Gráficos de Evolução */}
      {!loadingStats && stats && selectedProjectId && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Evolução Temporal</h2>
          <EvolutionCharts runId={selectedProjectId} />
        </div>
      )}

      {/* Mensagem de seleção de projeto */}
      {!selectedProjectId && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-blue-900 font-medium">💡 Dica</p>
          <p className="text-blue-700 text-sm mt-1">
            Selecione um projeto no seletor global para ver estatísticas específicas
          </p>
        </div>
      )}
    </div>
  );
}
