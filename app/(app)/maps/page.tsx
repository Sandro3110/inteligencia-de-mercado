'use client';

import { useProject } from '@/lib/contexts/ProjectContext';
import { trpc } from '@/lib/trpc/client';

export default function MapsPage() {
  const { selectedProjectId } = useProject();

  // Buscar mercados (filtrados por projeto se houver seleção)
  const { data: mercados, isLoading } = trpc.mercados.list.useQuery(
    selectedProjectId ? { projectId: selectedProjectId } : undefined
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Mapas de Mercado</h1>
        <p>Carregando mercados...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mapas de Mercado</h1>
        <p className="text-gray-600 mt-1">Visualize e gerencie os mercados mapeados</p>

        {/* Indicador de filtro */}
        {selectedProjectId && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg inline-block">
            <p className="text-sm text-blue-800">
              🔍 Filtrando por projeto selecionado globalmente
            </p>
          </div>
        )}
      </div>

      {mercados && mercados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mercados.map((mercado) => (
            <div
              key={mercado.id}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="mb-3">
                <h3 className="font-bold text-lg text-gray-900">{mercado.nome}</h3>
                {mercado.segmentacao && (
                  <p className="text-sm text-gray-500 mt-1">Segmentação: {mercado.segmentacao}</p>
                )}
              </div>

              <div className="space-y-2 text-sm">
                {mercado.categoria && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Categoria:</span>
                    <span className="font-medium">{mercado.categoria}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Clientes:</span>
                  <span className="font-medium">{mercado.quantidadeClientes || 0}</span>
                </div>

                {mercado.tamanhoMercado && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Tamanho:</span>
                    <span className="font-medium text-xs">{mercado.tamanhoMercado}</span>
                  </div>
                )}

                {mercado.crescimentoAnual && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Crescimento:</span>
                    <span className="font-medium text-xs">{mercado.crescimentoAnual}</span>
                  </div>
                )}
              </div>

              {mercado.principaisPlayers && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Principais Players:</p>
                  <p className="text-xs text-gray-700 line-clamp-2">{mercado.principaisPlayers}</p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                ID: {mercado.id} | Projeto: {mercado.projectId}
                {mercado.pesquisaId && ` | Pesquisa: ${mercado.pesquisaId}`}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          <p className="text-gray-600 text-lg font-medium">
            {selectedProjectId
              ? 'Nenhum mercado encontrado para este projeto'
              : 'Nenhum mercado encontrado'}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Importe ou crie mercados para começar o mapeamento
          </p>
        </div>
      )}
    </div>
  );
}
