'use client';
export const dynamic = 'force-dynamic';


import { MercadoAccordionCard } from '@/components/MercadoAccordionCard';
import { CompararMercadosModal } from '@/components/CompararMercadosModal';
import { useSelectedProject } from '@/hooks/useSelectedProject';

export default function MarketsPage() {
  const { selectedProjectId } = useSelectedProject();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mercados</h1>
          <p className="text-gray-600 mt-1">
            Explore e compare mercados potenciais
          </p>
        </div>
        <CompararMercadosModal isOpen={false} onClose={() => {}} mercadoIds={[]} mercados={[]} />
      </div>

      <div className="space-y-4">
        {selectedProjectId ? (
          <div className="text-center py-12 text-gray-500">
            <p>Funcionalidade de listagem de mercados em desenvolvimento</p>
            <p className="text-sm mt-2">Use o botão "Comparar Mercados" para análise comparativa</p>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Selecione um projeto no header para explorar mercados
          </div>
        )}
      </div>
    </div>
  );
}
