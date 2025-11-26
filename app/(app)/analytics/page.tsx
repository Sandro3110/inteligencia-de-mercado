'use client';

import { useProject } from '@/lib/contexts/ProjectContext';
import { trpc } from '@/lib/trpc/client';

export default function AnalyticsPage() {
  const { selectedProjectId } = useProject();
  
  // Buscar dados para analytics
  const { data: projects } = trpc.projects.list.useQuery();
  const { data: pesquisas } = trpc.pesquisas.list.useQuery(
    selectedProjectId ? { projectId: selectedProjectId } : undefined
  );
  const { data: mercados } = trpc.mercados.list.useQuery(
    selectedProjectId ? { projectId: selectedProjectId } : undefined
  );

  // Calcular métricas
  const totalProjects = projects?.length || 0;
  const totalPesquisas = pesquisas?.length || 0;
  const totalMercados = mercados?.length || 0;
  const totalClientes = pesquisas?.reduce((sum, p) => sum + (p.totalClientes || 0), 0) || 0;
  const clientesEnriquecidos = pesquisas?.reduce((sum, p) => sum + (p.clientesEnriquecidos || 0), 0) || 0;
  const taxaEnriquecimento = totalClientes > 0 
    ? ((clientesEnriquecidos / totalClientes) * 100).toFixed(1) 
    : '0';

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-gray-600 mt-1">
          Visualize métricas e indicadores do sistema
        </p>
        
        {/* Indicador de filtro */}
        {selectedProjectId && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg inline-block">
            <p className="text-sm text-blue-800">
              🔍 Filtrando por projeto selecionado globalmente
            </p>
          </div>
        )}
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Projetos */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Projetos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalProjects}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">Total de projetos ativos</p>
        </div>

        {/* Pesquisas */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pesquisas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalPesquisas}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            {selectedProjectId ? 'Pesquisas do projeto selecionado' : 'Total de pesquisas'}
          </p>
        </div>

        {/* Mercados */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mercados</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalMercados}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            {selectedProjectId ? 'Mercados do projeto selecionado' : 'Total de mercados mapeados'}
          </p>
        </div>

        {/* Clientes */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clientes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalClientes.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">Total de clientes nas pesquisas</p>
        </div>

        {/* Clientes Enriquecidos */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Enriquecidos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{clientesEnriquecidos.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">Clientes com dados enriquecidos</p>
        </div>

        {/* Taxa de Enriquecimento */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Enriquecimento</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{taxaEnriquecimento}%</p>
            </div>
            <div className="p-3 bg-pink-100 rounded-full">
              <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">Percentual de clientes enriquecidos</p>
        </div>
      </div>

      {/* Gráfico Placeholder */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Visão Geral</h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-600 font-medium">Gráficos em desenvolvimento</p>
            <p className="text-gray-500 text-sm mt-2">Em breve: gráficos interativos e relatórios detalhados</p>
          </div>
        </div>
      </div>

      {/* Debug Info */}
      <div className="bg-gray-100 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">🔍 Debug - Reatividade:</h4>
        <pre className="text-xs text-gray-600">
          {JSON.stringify({
            selectedProjectId,
            totalProjects,
            totalPesquisas,
            totalMercados,
            totalClientes,
            clientesEnriquecidos,
            taxaEnriquecimento: `${taxaEnriquecimento}%`,
            message: 'Esta página REAGE ao projeto selecionado no Dashboard'
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
