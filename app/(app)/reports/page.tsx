'use client';

import { useProject } from '@/lib/contexts/ProjectContext';
import { FileText } from 'lucide-react';
import dynamic from 'next/dynamic';

const ReportGenerator = dynamic(() => import('@/components/ReportGenerator'), { ssr: false });

export default function ReportsPage() {
  const { selectedProjectId } = useProject();

  if (!selectedProjectId) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Relatórios</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
          <p className="text-lg font-medium text-yellow-900">Selecione um projeto</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Relatórios</h1>
        <p className="text-gray-600">Gere relatórios executivos e análises estratégicas</p>
      </div>

      <ReportGenerator />
    </div>
  );
}
