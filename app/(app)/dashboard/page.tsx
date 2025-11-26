'use client';

import { useEffect } from 'react';
import { useProject } from '@/lib/contexts/ProjectContext';
import { trpc } from '@/lib/trpc/client';
import { Building2, Users, Target, TrendingUp, Briefcase, UserCheck } from 'lucide-react';

export default function DashboardPage() {
  const { selectedProjectId, setSelectedProjectId } = useProject();

  // Buscar projetos
  const { data: projects, isLoading: loadingProjects } = trpc.projects.list.useQuery();
  
  // Buscar estatísticas
  const { data: stats, isLoading: loadingStats, refetch: refetchStats } = trpc.dashboard.stats.useQuery(
    selectedProjectId ? { projectId: selectedProjectId } : undefined,
    { 
      refetchOnWindowFocus: false,
    }
  );

  // Refetch stats quando projeto mudar
  useEffect(() => {
    refetchStats();
  }, [selectedProjectId, refetchStats]);

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const newId = value ? Number(value) : null;
    setSelectedProjectId(newId);
  };

  const selectedProject = projects?.find((p) => p.id === selectedProjectId);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Visão geral do sistema de inteligência de mercado</p>
      </div>

      {/* Seletor de Projetos */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Filtrar por Projeto
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

        {selectedProject && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Projeto selecionado:</strong> {selectedProject.nome}
            </p>
            {selectedProject.descricao && (
              <p className="text-xs text-blue-600 mt-1">{selectedProject.descricao}</p>
            )}
          </div>
        )}
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Projetos */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Projetos Ativos</h3>
            <Building2 className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {loadingStats ? (
              <span className="animate-pulse">-</span>
            ) : (
              stats?.projects || 0
            )}
          </p>
          <p className="text-xs text-gray-500 mt-2">Total de projetos no sistema</p>
        </div>

        {/* Pesquisas */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Pesquisas</h3>
            <TrendingUp className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {loadingStats ? (
              <span className="animate-pulse">-</span>
            ) : (
              stats?.pesquisas || 0
            )}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {selectedProjectId ? 'Neste projeto' : 'Em todos os projetos'}
          </p>
        </div>

        {/* Mercados */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Mercados</h3>
            <Target className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {loadingStats ? (
              <span className="animate-pulse">-</span>
            ) : (
              stats?.mercados || 0
            )}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {selectedProjectId ? 'Neste projeto' : 'Em todos os projetos'}
          </p>
        </div>

        {/* Leads */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Leads</h3>
            <Users className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {loadingStats ? (
              <span className="animate-pulse">-</span>
            ) : (
              stats?.leads || 0
            )}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {selectedProjectId ? 'Neste projeto' : 'Em todos os projetos'}
          </p>
        </div>

        {/* Clientes */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Clientes</h3>
            <UserCheck className="w-8 h-8 text-indigo-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {loadingStats ? (
              <span className="animate-pulse">-</span>
            ) : (
              stats?.clientes || 0
            )}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {selectedProjectId ? 'Neste projeto' : 'Em todos os projetos'}
          </p>
        </div>

        {/* Concorrentes */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Concorrentes</h3>
            <Briefcase className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {loadingStats ? (
              <span className="animate-pulse">-</span>
            ) : (
              stats?.concorrentes || 0
            )}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {selectedProjectId ? 'Neste projeto' : 'Em todos os projetos'}
          </p>
        </div>
      </div>

      {/* Bem-vindo */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">Bem-vindo ao IntelMarket! 🎉</h2>
        <p className="text-blue-100">
          Sistema completo de inteligência de mercado para análise de dados, leads e oportunidades de negócio.
        </p>
      </div>
    </div>
  );
}
