'use client';

import { useProject } from '@/lib/contexts/ProjectContext';
import { trpc } from '@/lib/trpc/client';
import { BarChart3, TrendingUp, Users, Target, Award, Percent } from 'lucide-react';

export default function AnalyticsPage() {
  const { selectedProjectId } = useProject();
  
  // Buscar overview do novo router de analytics
  const { data: overview, isLoading: loadingOverview } = trpc.analytics.overview.useQuery(
    selectedProjectId ? { projectId: selectedProjectId } : undefined,
    { enabled: !!selectedProjectId }
  );

  // Buscar leads por estágio
  const { data: leadsByStage, isLoading: loadingStage } = trpc.analytics.leadsByStage.useQuery(
    selectedProjectId ? { projectId: selectedProjectId } : undefined,
    { enabled: !!selectedProjectId }
  );

  // Buscar leads por validação
  const { data: leadsByValidation } = trpc.analytics.leadsByValidation.useQuery(
    selectedProjectId ? { projectId: selectedProjectId } : undefined,
    { enabled: !!selectedProjectId }
  );

  // Buscar top mercados
  const { data: topMarkets } = trpc.analytics.topMarkets.useQuery(
    selectedProjectId ? { projectId: selectedProjectId, limit: 5 } : undefined,
    { enabled: !!selectedProjectId }
  );

  if (!selectedProjectId) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Analytics</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
          <p className="text-lg font-medium text-yellow-900">Selecione um projeto</p>
          <p className="text-sm text-yellow-700 mt-2">
            Para visualizar analytics, selecione um projeto no seletor global
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Métricas e análises detalhadas do projeto</p>
      </div>

      {/* Cards de Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Pesquisas</h3>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {loadingOverview ? '-' : overview?.pesquisas || 0}
          </p>
          <p className="text-xs text-gray-500 mt-2">Total de pesquisas</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Mercados</h3>
            <Target className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {loadingOverview ? '-' : overview?.mercados || 0}
          </p>
          <p className="text-xs text-gray-500 mt-2">Mercados mapeados</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Leads</h3>
            <Users className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {loadingOverview ? '-' : overview?.leads || 0}
          </p>
          <p className="text-xs text-gray-500 mt-2">Total de leads</p>
        </div>
      </div>

      {/* Distribuição de Leads por Estágio */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Award className="w-6 h-6 text-blue-600" />
          Leads por Estágio
        </h2>
        {loadingStage ? (
          <p className="text-gray-500">Carregando...</p>
        ) : leadsByStage && leadsByStage.length > 0 ? (
          <div className="space-y-3">
            {leadsByStage.map((item) => (
              <div key={item.stage} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700 capitalize">{item.stage}</span>
                <span className="text-2xl font-bold text-blue-600">{item.count}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Nenhum dado disponível</p>
        )}
      </div>

      {/* Distribuição de Leads por Status de Validação */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Percent className="w-6 h-6 text-green-600" />
          Leads por Status de Validação
        </h2>
        {leadsByValidation && leadsByValidation.length > 0 ? (
          <div className="space-y-3">
            {leadsByValidation.map((item) => (
              <div key={item.status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700 capitalize">{item.status}</span>
                <span className="text-2xl font-bold text-green-600">{item.count}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Nenhum dado disponível</p>
        )}
      </div>

      {/* Top 5 Mercados */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-purple-600" />
          Top 5 Mercados
        </h2>
        {topMarkets && topMarkets.length > 0 ? (
          <div className="space-y-3">
            {topMarkets.map((market, index) => (
              <div key={market.mercadoId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-600 rounded-full font-bold">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-700">{market.mercadoNome}</span>
                </div>
                <span className="text-xl font-bold text-purple-600">{market.leadsCount} leads</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Nenhum mercado encontrado</p>
        )}
      </div>
    </div>
  );
}
