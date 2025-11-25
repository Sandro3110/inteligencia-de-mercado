'use client';

import GeoCockpit from '@/components/GeoCockpit';
import { useSelectedProject } from '@/hooks/useSelectedProject';

export default function MapsPage() {
  const { selectedProjectId } = useSelectedProject();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mapas</h1>
        <p className="text-gray-600 mt-1">
          Visualização geográfica de dados e análise territorial
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {selectedProjectId ? (
          <GeoCockpit 
            entityType="cliente" 
            entityId={selectedProjectId} 
            entityName="Projeto" 
            address="" 
            onSave={async () => {}} 
          />
        ) : (
          <div className="text-center py-12 text-gray-500">
            Selecione um projeto no header para visualizar os mapas
          </div>
        )}
      </div>
    </div>
  );
}
