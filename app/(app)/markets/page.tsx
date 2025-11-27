'use client';

import { useState } from 'react';
import { useProject } from '@/lib/contexts/ProjectContext';
import { trpc } from '@/lib/trpc/client';
import { Target, MapPin, TrendingUp, Users, Map as MapIcon } from 'lucide-react';
import dynamic from 'next/dynamic';

// Lazy load map para evitar problemas SSR
const MapContainer = dynamic(() => import('@/components/maps/MapContainer'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <MapIcon className="w-12 h-12 mx-auto mb-2 text-gray-400 animate-pulse" />
        <p className="text-gray-500">Carregando mapa...</p>
      </div>
    </div>
  ),
});

export default function MarketsPage() {
  const { selectedProjectId } = useProject();
  const [viewMode, setViewMode] = useState<'cards' | 'map'>('cards');
  
  // Buscar mercados
  const { data: mercados, isLoading } = trpc.mercados.list.useQuery({
    projectId: selectedProjectId || undefined,
  });

  if (!selectedProjectId) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Mercados</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <Target className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
          <p className="text-lg font-medium text-yellow-900">Selecione um projeto</p>
          <p className="text-sm text-yellow-700 mt-2">
            Para visualizar mercados, selecione um projeto no seletor global
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mercados</h1>
          <p className="text-gray-600">Mercados únicos identificados e mapeados</p>
        </div>

        {/* Toggle View */}
        <div className="flex gap-2 bg-white rounded-lg shadow p-1">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-4 py-2 rounded transition-colors ${
              viewMode === 'cards'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Target className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-4 py-2 rounded transition-colors ${
              viewMode === 'map'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MapIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* View Content */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Carregando mercados...</p>
        </div>
      ) : mercados && mercados.length > 0 ? (
        <>
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mercados.map((mercado) => (
                <div key={mercado.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                  {/* Header do Card */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{mercado.nome}</h3>
                      {mercado.categoria && (
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                          {mercado.categoria}
                        </span>
                      )}
                    </div>
                    <Target className="w-8 h-8 text-purple-500 flex-shrink-0" />
                  </div>

                  {/* Informações */}
                  <div className="space-y-3">
                    {/* Segmentação */}
                    {mercado.segmentacao && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Segmentação</p>
                          <p className="text-sm text-gray-700">{mercado.segmentacao}</p>
                        </div>
                      </div>
                    )}

                    {/* Tamanho do Mercado */}
                    {mercado.tamanhoMercado && (
                      <div className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Tamanho</p>
                          <p className="text-sm text-gray-700">{mercado.tamanhoMercado}</p>
                        </div>
                      </div>
                    )}

                    {/* Crescimento Anual */}
                    {mercado.crescimentoAnual && (
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <span className="text-xs text-green-700">Crescimento Anual</span>
                        <span className="text-sm font-bold text-green-800">{mercado.crescimentoAnual}</span>
                      </div>
                    )}

                    {/* Quantidade de Clientes */}
                    <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-xs text-blue-700">Clientes</span>
                      </div>
                      <span className="text-sm font-bold text-blue-800">{mercado.quantidadeClientes || 0}</span>
                    </div>

                    {/* Tendências */}
                    {mercado.tendencias && (
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Tendências</p>
                        <p className="text-sm text-gray-700 line-clamp-2">{mercado.tendencias}</p>
                      </div>
                    )}

                    {/* Principais Players */}
                    {mercado.principaisPlayers && (
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Principais Players</p>
                        <p className="text-sm text-gray-700 line-clamp-2">{mercado.principaisPlayers}</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                    <span>ID: {mercado.id}</span>
                    {mercado.pesquisaId && <span>Pesquisa: {mercado.pesquisaId}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold mb-4">Mapa de Mercados</h2>
              <MapContainer height="600px">
                {/* TODO: Adicionar markers dos mercados */}
              </MapContainer>
              <p className="text-sm text-gray-500 mt-4 text-center">
                Markers de mercados serão adicionados em breve
              </p>
            </div>
          )}

          {/* Estatísticas */}
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4">Estatísticas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-3xl font-bold text-purple-600">{mercados.length}</p>
                <p className="text-sm text-purple-700 mt-1">Mercados Mapeados</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">
                  {mercados.reduce((sum, m) => sum + (m.quantidadeClientes || 0), 0)}
                </p>
                <p className="text-sm text-blue-700 mt-1">Total de Clientes</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">
                  {Math.round(mercados.reduce((sum, m) => sum + (m.quantidadeClientes || 0), 0) / mercados.length)}
                </p>
                <p className="text-sm text-green-700 mt-1">Média por Mercado</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600 text-lg font-medium">Nenhum mercado encontrado</p>
          <p className="text-gray-500 text-sm mt-2">
            Crie uma pesquisa para identificar mercados
          </p>
        </div>
      )}
    </div>
  );
}
