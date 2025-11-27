'use client';

import { useProject } from '@/lib/contexts/ProjectContext';
import { FileText } from 'lucide-react';

export default function ReportsPage() {
  const { selectedProjectId } = useProject();

  if (!selectedProjectId) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Relatórios</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
          <p className="text-lg font-medium text-yellow-900">Selecione um projeto</p>
          <p className="text-sm text-yellow-700 mt-2">
            Para visualizar relatórios, selecione um projeto no seletor global
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Relatórios</h1>
        <p className="text-gray-600">Agendamentos e automação de relatórios</p>
      </div>

      {/* Placeholder */}
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-600 text-lg font-medium">Funcionalidade em desenvolvimento</p>
        <p className="text-gray-500 text-sm mt-2">
          Em breve: relatórios personalizados em PDF, Excel e outros formatos
        </p>
      </div>
    </div>
  );
}
