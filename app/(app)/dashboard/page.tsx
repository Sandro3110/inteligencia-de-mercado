'use client';

import { useProject } from '@/lib/contexts/ProjectContext';
import { trpc } from '@/lib/trpc/client';
import { Building2, Users, Target, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { selectedProjectId, setSelectedProjectId } = useProject();

  // Buscar projetos
  const { data: projects, isLoading: loadingProjects } = trpc.projects.list.useQuery();
  
  // Buscar estatísticas usando o novo router dashboard
  const { data: stats, isLoading: loadingStats } = trpc.dashboard.stats.useQuery(
    selectedProjectId ? { projectId: selectedProjectId } : {},
    { refetchOnWindowFocus: false }
  );

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const newId = value ? Number(value) : null;
    setSelectedProjectId(newId);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header com Seletor de Projetos */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>

        {/* Seletor de Projetos GLOBAL */}
        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🎯 Seletor Global de Projetos:
          </label>

          {loadingProjects ? (
            <div className="text-gray-500">Carregando projetos...</div>
          ) : projects && projects.length > 0 ? (
            <select
              value={selectedProjectId === null ? '' : selectedProjectId}
              onChange={handleProjectChange}
              className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os projetos</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.nome}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-gray-500">Nenhum projeto encontrado</div>
          )}

          {/* Indicador do projeto selecionado */}
          {selectedProjectId && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                ✓ Projeto selecionado GLOBALMENTE:{' '}
                <strong>{projects?.find((p) => p.id === selectedProjectId)?.nome}</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Todas as páginas verão este projeto selecionado
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bem-vindo */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          🎉 Bem-vindo ao IntelMarket!
        </h2>
        <p className="text-gray-600">
          Sistema de inteligência de mercado para análise de dados, leads e oportunidades.
        </p>
        {selectedProjectId && (
          <p className="text-sm text-blue-600 mt-2">
            Visualizando dados do projeto: <strong>{projects?.find((p) => p.id === selectedProjectId)?.nome}</strong>
          </p>
        )}
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Projetos */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Projetos</h3>
            <Building2 className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {loadingStats ? '-' : stats?.projects || 0}
          </p>
        </div>

        {/* Leads */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Leads</h3>
            <Users className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {loadingStats ? '-' : stats?.leads || 0}
          </p>
        </div>

        {/* Mercados */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Mercados</h3>
            <Target className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {loadingStats ? '-' : stats?.mercados || 0}
          </p>
        </div>

        {/* Pesquisas */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Pesquisas</h3>
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {loadingStats ? '-' : stats?.pesquisas || 0}
          </p>
        </div>
      </div>

      {/* Atividade Recente */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Atividade Recente</h2>
        <p className="text-gray-500 text-sm">Em breve: Timeline de atividades recentes</p>
      </div>
    </div>
  );
}
