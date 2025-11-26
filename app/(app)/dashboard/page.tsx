'use client';

import { useProject } from '@/lib/contexts/ProjectContext';
import { trpc } from '@/lib/trpc/client';

export default function DashboardPage() {
  const { selectedProjectId, setSelectedProjectId } = useProject();

  // Log quando selectedProjectId muda
  console.log('🔍 selectedProjectId atual:', selectedProjectId);

  // Buscar projetos
  const { data: projects, isLoading: loadingProjects } = trpc.projects.list.useQuery();
  
  // Buscar estatísticas do projeto selecionado
  const { data: pesquisas } = trpc.pesquisas.list.useQuery(
    selectedProjectId ? { projectId: selectedProjectId } : undefined,
    { enabled: !!selectedProjectId }
  );
  
  const { data: mercados } = trpc.mercados.list.useQuery(
    selectedProjectId ? { projectId: selectedProjectId } : undefined,
    { enabled: !!selectedProjectId }
  );
  
  const { data: leads } = trpc.leads.list.useQuery(
    selectedProjectId ? { projectId: selectedProjectId } : {},
    { enabled: !!selectedProjectId }
  );

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const newId = value ? Number(value) : null;
    console.log('🎯 Projeto selecionado:', { value, newId });
    setSelectedProjectId(newId);
    console.log('✅ setSelectedProjectId chamado com:', newId);
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

      {/* Welcome Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bem-vindo ao IntelMarket! 🎉</h2>
        <p className="text-gray-600">
          Sistema de inteligência de mercado para análise de dados, leads e oportunidades.
        </p>
        {selectedProjectId && (
          <p className="text-sm text-blue-600 mt-2">
            Visualizando dados do projeto:{' '}
            <strong>{projects?.find((p) => p.id === selectedProjectId)?.nome}</strong>
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Projetos</p>
              <p className="text-3xl font-bold text-gray-900">{projects?.length || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Leads</p>
              <p className="text-3xl font-bold text-gray-900">{leads?.length || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mercados</p>
              <p className="text-3xl font-bold text-gray-900">{mercados?.length || 0}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pesquisas</p>
              <p className="text-3xl font-bold text-gray-900">{pesquisas?.length || 0}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
