'use client';

import { EnrichmentProgress } from '@/components/EnrichmentProgress';
import { ScheduleEnrichment } from '@/components/ScheduleEnrichment';
import { FileUploadParser } from '@/components/FileUploadParser';
import { useSelectedProject } from '@/hooks/useSelectedProject';

export default function EnrichmentPage() {
  const { selectedProjectId } = useSelectedProject();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Enriquecimento de Dados</h1>
        <p className="text-gray-600 mt-1">
          Enriqueça seus dados com informações adicionais
        </p>
      </div>

      {selectedProjectId ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Upload de Dados</h2>
            <FileUploadParser onDataParsed={(data) => console.log('Data parsed:', data)} />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Agendar Enriquecimento</h2>
            <ScheduleEnrichment projectId={selectedProjectId} />
          </div>

          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Progresso</h2>
            <EnrichmentProgress steps={[]} currentStep={0} totalProgress={0} />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center py-12 text-gray-500">
          Selecione um projeto no header para enriquecer dados
        </div>
      )}
    </div>
  );
}
