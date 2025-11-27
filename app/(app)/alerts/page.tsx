'use client';

import { useProject } from '@/lib/contexts/ProjectContext';
import { trpc } from '@/lib/trpc/client';
import { Bell, ToggleLeft, ToggleRight, Clock, CheckCircle } from 'lucide-react';

export default function AlertsPage() {
  const { selectedProjectId } = useProject();
  
  // Buscar configurações de alertas
  const { data: configs, isLoading: loadingConfigs } = trpc.alerts.listConfigs.useQuery({
    projectId: selectedProjectId || undefined,
  });

  // Buscar histórico de alertas
  const { data: history, isLoading: loadingHistory } = trpc.alerts.listHistory.useQuery({
    projectId: selectedProjectId || undefined,
    limit: 20,
  });

  // Buscar estatísticas
  const { data: stats } = trpc.alerts.getStats.useQuery(
    { projectId: selectedProjectId! },
    { enabled: !!selectedProjectId }
  );

  if (!selectedProjectId) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Alertas</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <Bell className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
          <p className="text-lg font-medium text-yellow-900">Selecione um projeto</p>
          <p className="text-sm text-yellow-700 mt-2">
            Para visualizar alertas, selecione um projeto no seletor global
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Alertas</h1>
        <p className="text-gray-600">Configure notificações automáticas</p>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total de Alertas</span>
              <Bell className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalConfigs}</p>
          </div>

          <div className="bg-green-50 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-green-700">Alertas Ativos</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-900">{stats.activeConfigs}</p>
          </div>

          <div className="bg-blue-50 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-700">Disparos Totais</span>
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-900">{stats.totalHistory}</p>
          </div>
        </div>
      )}

      {/* Configurações de Alertas */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold">Configurações de Alertas</h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            + Novo Alerta
          </button>
        </div>

        {loadingConfigs ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Carregando configurações...</p>
          </div>
        ) : configs && configs.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {configs.map((config) => (
              <div key={config.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{config.name}</h3>
                      {config.active === 1 ? (
                        <ToggleRight className="w-6 h-6 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {config.alertType}
                      </span>
                      {config.frequency && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {config.frequency}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    config.active === 1 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {config.active === 1 ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                {/* Destinatários */}
                {config.recipients && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Destinatários:</p>
                    <div className="flex flex-wrap gap-2">
                      {config.recipients.split(',').map((recipient, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded"
                        >
                          {recipient.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Última Execução */}
                {config.lastTriggered && (
                  <div className="text-sm text-gray-600">
                    <span className="text-gray-500">Último disparo:</span>{' '}
                    {new Date(config.lastTriggered).toLocaleString('pt-BR')}
                  </div>
                )}

                {/* Ações */}
                <div className="mt-4 flex items-center gap-2">
                  <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors">
                    Editar
                  </button>
                  <button className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded transition-colors">
                    Testar
                  </button>
                  <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors">
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 text-lg font-medium">Nenhum alerta configurado</p>
            <p className="text-gray-500 text-sm mt-2">
              Crie seu primeiro alerta para receber notificações automáticas
            </p>
            <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Criar Primeiro Alerta
            </button>
          </div>
        )}
      </div>

      {/* Histórico de Alertas */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold">Histórico de Disparos</h2>
        </div>

        {loadingHistory ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Carregando histórico...</p>
          </div>
        ) : history && history.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {history.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(item.triggeredAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <Bell className="w-5 h-5 text-blue-500 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 text-sm">Nenhum disparo registrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
