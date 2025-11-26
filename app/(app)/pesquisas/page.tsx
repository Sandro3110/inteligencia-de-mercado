'use client';

import { useProject } from '@/lib/contexts/ProjectContext';
import { trpc } from '@/lib/trpc/client';

export default function PesquisasPage() {
  const { selectedProjectId } = useProject();
  
  // Buscar pesquisas (filtradas por projeto se houver seleção)
  const { data: pesquisas, isLoading } = trpc.pesquisas.list.useQuery(
    selectedProjectId ? { projectId: selectedProjectId } : undefined
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Pesquisas</h1>
        <p>Carregando pesquisas...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pesquisas</h1>
        <p className="text-gray-600 mt-1">
          Gerencie suas pesquisas de mercado
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

      {pesquisas && pesquisas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pesquisas.map((pesquisa) => (
            <div key={pesquisa.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="mb-3">
                <h3 className="font-bold text-lg text-gray-900">{pesquisa.nome}</h3>
                <p className="text-gray-600 text-sm mt-1">
                  {pesquisa.descricao || 'Sem descrição'}
                </p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    pesquisa.status === 'importado' ? 'bg-green-100 text-green-800' :
                    pesquisa.status === 'em_andamento' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {pesquisa.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Clientes:</span>
                  <span className="font-medium">{pesquisa.totalClientes || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Enriquecidos:</span>
                  <span className="font-medium">{pesquisa.clientesEnriquecidos || 0}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                ID: {pesquisa.id} | Projeto: {pesquisa.projectId}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-gray-600 text-lg font-medium">
            {selectedProjectId 
              ? 'Nenhuma pesquisa encontrada para este projeto' 
              : 'Nenhuma pesquisa encontrada'}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Crie uma nova pesquisa para começar
          </p>
        </div>
      )}

      {/* Debug Info */}
      <div className="mt-8 bg-gray-100 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">🔍 Debug - Reatividade:</h4>
        <pre className="text-xs text-gray-600">
          {JSON.stringify({
            selectedProjectId,
            totalPesquisas: pesquisas?.length || 0,
            message: 'Esta página REAGE ao projeto selecionado no Dashboard'
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
