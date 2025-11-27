'use client';

import { useState } from 'react';
import { useProject } from '@/lib/contexts/ProjectContext';
import { trpc } from '@/lib/trpc/client';
import { BarChart3, TrendingUp, Target, Activity, Users, Building2, Globe } from 'lucide-react';

type TabType = 'overview' | 'metrics' | 'comparative' | 'interactive';

export default function AnalyticsPage() {
  const { selectedProjectId } = useProject();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Buscar dados
  const { data: stats } = trpc.dashboard.stats.useQuery(
    selectedProjectId ? { projectId: selectedProjectId } : undefined
  );

  if (!selectedProjectId) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto text-center py-12">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Selecione um Projeto
          </h2>
          <p className="text-gray-600">
            Escolha um projeto no seletor global para visualizar análises e métricas
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: Activity },
    { id: 'metrics', label: 'Métricas', icon: TrendingUp },
    { id: 'comparative', label: 'Comparativo', icon: Target },
    { id: 'interactive', label: 'Interativo', icon: BarChart3 },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">
          Análises detalhadas e métricas do projeto selecionado
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Visão Geral</h2>
              
              {/* Cards de Métricas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Building2 className="w-8 h-8 text-blue-600" />
                    <span className="text-xs font-medium text-blue-600 bg-blue-200 px-2 py-1 rounded">PROJETOS</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-900">{(stats as any)?.projects || 0}</p>
                  <p className="text-sm text-blue-700 mt-1">Total de projetos</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8 text-green-600" />
                    <span className="text-xs font-medium text-green-600 bg-green-200 px-2 py-1 rounded">LEADS</span>
                  </div>
                  <p className="text-3xl font-bold text-green-900">{(stats as any)?.leads || 0}</p>
                  <p className="text-sm text-green-700 mt-1">Leads capturados</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Globe className="w-8 h-8 text-purple-600" />
                    <span className="text-xs font-medium text-purple-600 bg-purple-200 px-2 py-1 rounded">MERCADOS</span>
                  </div>
                  <p className="text-3xl font-bold text-purple-900">{(stats as any)?.mercados || 0}</p>
                  <p className="text-sm text-purple-700 mt-1">Mercados mapeados</p>
                </div>
              </div>

              {/* Placeholder para gráficos */}
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 font-medium">Gráficos de evolução</p>
                <p className="text-gray-500 text-sm mt-2">
                  Visualizações avançadas serão adicionadas em breve
                </p>
              </div>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 font-medium">Métricas Detalhadas</p>
              <p className="text-gray-500 text-sm mt-2">Em desenvolvimento...</p>
            </div>
          )}

          {activeTab === 'comparative' && (
            <div className="text-center py-12">
              <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 font-medium">Análise Comparativa</p>
              <p className="text-gray-500 text-sm mt-2">Em desenvolvimento...</p>
            </div>
          )}

          {activeTab === 'interactive' && (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 font-medium">Dashboard Interativo</p>
              <p className="text-gray-500 text-sm mt-2">Em desenvolvimento...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
