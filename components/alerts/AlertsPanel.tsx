'use client';

import { useState } from 'react';
import { useApp } from '@/lib/contexts/AppContext';
import { trpc } from '@/lib/trpc/client';
import { Bell, Plus, Settings, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AlertsPanel() {
  const { selectedProjectId } = useApp();
  const [showConfig, setShowConfig] = useState(false);

  const { data: stats, isLoading: statsLoading } = trpc.alerts.stats.useQuery(
    { projectId: selectedProjectId! },
    { enabled: !!selectedProjectId }
  );

  const { data: history, isLoading: historyLoading } = trpc.alerts.history.useQuery(
    { projectId: selectedProjectId!, limit: 10 },
    { enabled: !!selectedProjectId }
  );

  const { data: configs } = trpc.alerts.list.useQuery(
    { projectId: selectedProjectId! },
    { enabled: !!selectedProjectId }
  );

  if (!selectedProjectId) {
    return (
      <div className="p-8 text-center">
        <Bell className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">Selecione um projeto para ver os alertas</p>
      </div>
    );
  }

  if (statsLoading || historyLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bell className="w-8 h-8 text-blue-600" />
            Sistema de Alertas
          </h1>
          <p className="text-gray-600 mt-1">
            Monitore automaticamente mudanças e oportunidades
          </p>
        </div>
        <button
          onClick={() => setShowConfig(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Alerta
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Alertas Configurados</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats?.totalConfigs || 0}
              </p>
            </div>
            <Settings className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Alertas Ativos</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {stats?.activeConfigs || 0}
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Disparados (30 dias)</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">
                {stats?.triggeredInPeriod || 0}
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Alertas por Tipo */}
      {stats?.byType && stats.byType.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Alertas por Tipo (últimos 30 dias)
          </h2>
          <div className="space-y-3">
            {stats.byType.map((item: any) => (
              <div key={item.alertType} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <span className="text-gray-700 capitalize">
                    {item.alertType.replace(/_/g, ' ')}
                  </span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Histórico Recente */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Histórico Recente
        </h2>
        {history && history.length > 0 ? (
          <div className="space-y-3">
            {history.map((alert: any) => (
              <div
                key={alert.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                        {alert.alertType.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(alert.triggeredAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{alert.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Nenhum alerta disparado recentemente</p>
          </div>
        )}
      </div>

      {/* Configurações Ativas */}
      {configs && configs.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Configurações Ativas
          </h2>
          <div className="space-y-3">
            {configs.map((config: any) => (
              <div
                key={config.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{config.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Tipo: {config.alertType.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        config.enabled
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {config.enabled ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
