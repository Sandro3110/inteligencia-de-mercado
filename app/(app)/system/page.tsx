'use client';

import { Settings, Bell, FileText, Activity } from 'lucide-react';
import { useState } from 'react';

export default function SystemPage() {
  const [activeTab, setActiveTab] = useState<'alerts' | 'settings' | 'logs'>('alerts');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Settings className="w-8 h-8 text-blue-600" />
          Sistema
        </h1>
        <p className="text-gray-600">
          Configurações, alertas e monitoramento do sistema
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`pb-4 px-2 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'alerts'
                ? 'border-blue-600 text-blue-600 font-medium'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Bell className="w-5 h-5" />
            Alertas
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-4 px-2 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600 font-medium'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings className="w-5 h-5" />
            Configurações
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-4 px-2 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'logs'
                ? 'border-blue-600 text-blue-600 font-medium'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Activity className="w-5 h-5" />
            Logs
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'alerts' && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Configuração de Alertas
          </h3>
          <p className="text-gray-600">
            Configure alertas automáticos para eventos importantes
          </p>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Configurações Globais
          </h3>
          <p className="text-gray-600">
            Gerencie configurações do sistema e integrações
          </p>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Logs do Sistema
          </h3>
          <p className="text-gray-600">
            Visualize logs e auditoria de atividades
          </p>
        </div>
      )}
    </div>
  );
}
