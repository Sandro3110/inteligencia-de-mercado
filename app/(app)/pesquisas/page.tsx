'use client';

import { PesquisaSelector } from '@/components/PesquisaSelector';
import { useSelectedProject } from '@/hooks/useSelectedProject';

export default function PesquisasPage() {
  const { selectedProjectId } = useSelectedProject();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pesquisas</h1>
        <p className="text-gray-600 mt-1">
          Crie e gerencie suas pesquisas de mercado
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {selectedProjectId ? (
          <PesquisaSelector />
        ) : (
          <div className="text-center py-12 text-gray-500">
            Selecione um projeto no header para gerenciar pesquisas
          </div>
        )}
      </div>
    </div>
  );
}
