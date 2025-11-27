'use client';

import { useProject } from '@/lib/contexts/ProjectContext';
import { trpc } from '@/lib/trpc/client';
import { Plus, Search, Calendar, Users, TrendingUp } from 'lucide-react';
import { useState } from 'react';

export default function PesquisasPage() {
  const { selectedProjectId } = useProject();
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Buscar pesquisas (filtradas por projeto se houver seleção)
  const { data: pesquisas, isLoading } = trpc.pesquisas.list.useQuery(
    selectedProjectId ? { projectId: selectedProjectId } : undefined
  );

  if (!selectedProjectId) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto text-center py-12">
          <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Selecione um Projeto
          </h2>
          <p className="text-gray-600">
            Escolha um projeto no seletor global para visualizar e gerenciar pesquisas
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pesquisas</h1>
          <p className="text-gray-600">
            Gerencie suas pesquisas de mercado e importações de dados
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Pesquisa
        </button>
      </div>

      {/* Lista de Pesquisas */}
      {pesquisas && pesquisas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pesquisas.map((pesquisa) => (
            <div 
              key={pesquisa.id} 
              className="bg-white rounded-lg shadow hover:shadow-xl transition-all cursor-pointer group"
            >
              {/* Header do Card */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                    {pesquisa.nome}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    pesquisa.status === 'importado' ? 'bg-green-100 text-green-800' :
                    pesquisa.status === 'em_andamento' ? 'bg-yellow-100 text-yellow-800' :
                    pesquisa.status === 'processando' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {pesquisa.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {pesquisa.descricao || 'Sem descrição'}
                </p>
              </div>

              {/* Estatísticas */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Total de Clientes</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {pesquisa.totalClientes || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">Enriquecidos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">
                      {pesquisa.clientesEnriquecidos || 0}
                    </span>
                    {(pesquisa.totalClientes || 0) > 0 && (
                      <span className="text-xs text-gray-500">
                        ({Math.round(((pesquisa.clientesEnriquecidos || 0) / (pesquisa.totalClientes || 1)) * 100)}%)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Importado em</span>
                  </div>
                  <span className="text-sm text-gray-900">
                    {pesquisa.dataImportacao 
                      ? new Date(pesquisa.dataImportacao).toLocaleDateString('pt-BR')
                      : '-'}
                  </span>
                </div>

                {/* Barra de Progresso */}
                {(pesquisa.totalClientes || 0) > 0 && (
                  <div className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-600">Progresso de Enriquecimento</span>
                      <span className="text-xs font-medium text-gray-900">
                        {Math.round(((pesquisa.clientesEnriquecidos || 0) / (pesquisa.totalClientes || 1)) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ 
                          width: `${Math.min(((pesquisa.clientesEnriquecidos || 0) / (pesquisa.totalClientes || 1)) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
                ID: {pesquisa.id}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Nenhuma pesquisa encontrada
          </h3>
          <p className="text-gray-600 mb-6">
            Crie sua primeira pesquisa para começar a mapear mercados e identificar oportunidades
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Criar Primeira Pesquisa
          </button>
        </div>
      )}

      {/* Modal de Criação (placeholder) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Nova Pesquisa</h2>
            <p className="text-gray-600 mb-6">
              Wizard de criação será implementado em breve...
            </p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
