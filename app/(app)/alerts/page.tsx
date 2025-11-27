'use client';

import { useProject } from '@/lib/contexts/ProjectContext';
import { Bell } from 'lucide-react';
import dynamic from 'next/dynamic';

const AlertConfig = dynamic(() => import('@/components/AlertConfig'), { ssr: false });

export default function AlertsPage() {
  const { selectedProjectId } = useProject();

  if (!selectedProjectId) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Alertas</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <Bell className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
          <p className="text-lg font-medium text-yellow-900">Selecione um projeto</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Alertas</h1>
        <p className="text-gray-600">Configure notificações automáticas e alertas personalizados</p>
      </div>

      <AlertConfig />
    </div>
  );
}
