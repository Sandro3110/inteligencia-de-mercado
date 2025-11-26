'use client';
export const dynamic = 'force-dynamic';


import { ReportGenerator } from '@/components/ReportGenerator';
import { useSelectedProject } from '@/hooks/useSelectedProject';

export default function ReportsPage() {
  const { selectedProjectId } = useSelectedProject();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-600 mt-1">
          Gere e automatize relatórios personalizados
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {selectedProjectId ? (
          <ReportGenerator />
        ) : (
          <div className="text-center py-12 text-gray-500">
            Selecione um projeto no header para gerar relatórios
          </div>
        )}
      </div>
    </div>
  );
}
