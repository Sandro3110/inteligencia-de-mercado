'use client';
export const dynamic = 'force-dynamic';


import KanbanBoard from '@/components/KanbanBoard';
import { useSelectedProject } from '@/hooks/useSelectedProject';

export default function LeadsPage() {
  const { selectedProjectId } = useSelectedProject();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <p className="text-gray-600 mt-1">
          Gerencie seus leads e oportunidades
        </p>
      </div>

      <div>
        {selectedProjectId ? (
          <KanbanBoard mercadoId={0} leads={[]} />
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center py-12 text-gray-500">
            Selecione um projeto no header para visualizar leads
          </div>
        )}
      </div>
    </div>
  );
}
