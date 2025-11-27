'use client';

import { useProject } from '@/lib/contexts/ProjectContext';
import { trpc } from '@/lib/trpc/client';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  const { selectedProjectId } = useProject();
  
  // Buscar dados básicos dos routers existentes
  const { data: projects } = trpc.projects.list.useQuery();
  const { data: pesquisas } = trpc.pesquisas.list.useQuery(
    selectedProjectId ? { projectId: selectedProjectId } : undefined
  );
  const { data: mercados } = trpc.mercados.list.useQuery({
    projectId: selectedProjectId || undefined,
  });

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

  const totalProjects = projects?.length || 0;
  const totalPesquisas = pesquisas?.length || 0;
  const totalMercados = mercados?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Métricas e análises do projeto</p>
      </div>

      {/* Cards de Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Projetos</h3>
          <p className="text-3xl font-bold text-gray-900">{totalProjects}</p>
          <p className="text-xs text-gray-500 mt-2">Total de projetos</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Pesquisas</h3>
          <p className="text-3xl font-bold text-gray-900">{totalPesquisas}</p>
          <p className="text-xs text-gray-500 mt-2">Total de pesquisas</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Mercados</h3>
          <p className="text-3xl font-bold text-gray-900">{totalMercados}</p>
          <p className="text-xs text-gray-500 mt-2">Mercados mapeados</p>
        </div>
      </div>

      {/* Placeholder para gráficos */}
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-600 text-lg font-medium">Gráficos em desenvolvimento</p>
        <p className="text-gray-500 text-sm mt-2">
          Em breve: visualizações avançadas e relatórios detalhados
        </p>
      </div>
    </div>
  );
}
