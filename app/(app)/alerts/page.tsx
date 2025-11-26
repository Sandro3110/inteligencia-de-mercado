'use client';
export const dynamic = 'force-dynamic';


import { AlertConfig } from '@/components/AlertConfig';
import { NotificationPanel } from '@/components/NotificationPanel';
import { useSelectedProject } from '@/hooks/useSelectedProject';

export default function AlertsPage() {
  const { selectedProjectId } = useSelectedProject();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Alertas e Notificações</h1>
        <p className="text-gray-600 mt-1">
          Configure alertas e gerencie notificações
        </p>
      </div>

      {selectedProjectId ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Configurar Alertas</h2>
            <AlertConfig />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Notificações Recentes</h2>
            <NotificationPanel />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center py-12 text-gray-500">
          Selecione um projeto no header para configurar alertas
        </div>
      )}
    </div>
  );
}
