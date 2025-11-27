'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, ArrowLeftRight } from 'lucide-react';
import { CompararMercadosModal } from '@/components/CompararMercadosModal';
import { trpc } from '@/lib/trpc/client';
import { useProject } from '@/lib/contexts/ProjectContext';

export default function ComparePage() {
  const { selectedProjectId } = useProject();
  const [selectedMercados, setSelectedMercados] = useState<number[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Query para buscar mercados
  const { data: mercados } = trpc.mercados.list.useQuery(
    selectedProjectId ? { projectId: selectedProjectId } : undefined,
    { enabled: !!selectedProjectId }
  );

  const handleSelectMercado = (id: number) => {
    setSelectedMercados((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleCompare = () => {
    if (selectedMercados.length < 2) {
      alert('Selecione pelo menos 2 mercados para comparar');
      return;
    }
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          Comparação de Mercados
        </h1>
        <p className="text-gray-600">
          Compare mercados lado a lado com análises detalhadas
        </p>
      </div>

      {/* Selection Info */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ArrowLeftRight className="w-5 h-5 text-blue-600" />
          <span className="text-blue-900 font-medium">
            {selectedMercados.length} mercado(s) selecionado(s)
          </span>
        </div>
        <button
          onClick={handleCompare}
          disabled={selectedMercados.length < 2}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Comparar
        </button>
      </div>

      {/* Mercados List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Selecione os mercados para comparar
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Escolha pelo menos 2 mercados
          </p>
        </div>

        <div className="p-6">
          {!selectedProjectId ? (
            <div className="text-center py-12 text-gray-500">
              Selecione um projeto para ver os mercados
            </div>
          ) : mercados?.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Nenhum mercado encontrado neste projeto
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mercados?.map((mercado) => (
                <div
                  key={mercado.id}
                  onClick={() => handleSelectMercado(mercado.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedMercados.includes(mercado.id)
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {mercado.nome}
                    </h3>
                    {selectedMercados.includes(mercado.id) && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{mercado.segmentacao || '-'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <div className="text-sm text-gray-600">Total de Mercados</div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {mercados?.length || 0}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <ArrowLeftRight className="w-6 h-6 text-green-600" />
            <div className="text-sm text-gray-600">Selecionados</div>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {selectedMercados.length}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            <div className="text-sm text-gray-600">Comparações Hoje</div>
          </div>
          <div className="text-2xl font-bold text-purple-600">-</div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <CompararMercadosModal
          onOpenChange={setModalOpen}
          mercadoIds={selectedMercados}
        />
      )}
    </div>
  );
}
