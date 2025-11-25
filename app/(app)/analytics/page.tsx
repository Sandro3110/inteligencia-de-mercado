'use client';

import { EvolutionCharts } from '@/components/EvolutionCharts';
import { useSelectedProject } from '@/hooks/useSelectedProject';

export default function AnalyticsPage() {
  const { selectedProjectId } = useSelectedProject();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">
          Análises avançadas e métricas de desempenho
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {selectedProjectId ? (
          <EvolutionCharts />
        ) : (
          <div className="text-center py-12 text-gray-500">
            Selecione um projeto no header para visualizar as análises
          </div>
        )}
      </div>
    </div>
  );
}
