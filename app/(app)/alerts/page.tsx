'use client';

import { useProject } from '@/lib/contexts/ProjectContext';

export default function AlertsPage() {
  const { selectedProjectId } = useProject();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Alertas</h1>
        <p className="text-gray-600 mt-1">
          Configure e gerencie alertas automáticos
        </p>
        
        {/* Indicador de filtro */}
        {selectedProjectId && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg inline-block">
            <p className="text-sm text-blue-800">
              🔍 Filtrando por projeto selecionado globalmente
            </p>
          </div>
        )}
      </div>

      {/* Placeholder */}
      <div className="bg-white p-12 rounded-lg shadow text-center">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <p className="text-gray-600 text-lg font-medium">
          Funcionalidade em desenvolvimento
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Em breve: alertas personalizados por email, SMS e notificações push
        </p>
      </div>

      {/* Debug Info */}
      <div className="bg-gray-100 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">🔍 Debug - Reatividade:</h4>
        <pre className="text-xs text-gray-600">
          {JSON.stringify({
            selectedProjectId,
            message: 'Esta página REAGE ao projeto selecionado no Dashboard'
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
