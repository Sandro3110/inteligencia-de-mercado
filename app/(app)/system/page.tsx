'use client';

import { Settings, Bell, FileText, Activity, History, List } from 'lucide-react';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const AlertConfig = dynamic(() => import('@/components/AlertConfig'), { ssr: false });
const HistoryTimeline = dynamic(() => import('@/components/HistoryTimeline'), { ssr: false });
const HistoryFilters = dynamic(() => import('@/components/HistoryFilters'), { ssr: false });
const FilaTrabalho = dynamic(() => import('@/components/FilaTrabalho'), { ssr: false });

export default function SystemPage() {
  const [activeTab, setActiveTab] = useState<'alerts' | 'settings' | 'logs' | 'history' | 'queue'>('alerts');

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
          {[
            { id: 'alerts', label: 'Alertas', icon: Bell },
            { id: 'settings', label: 'Configurações', icon: Settings },
            { id: 'logs', label: 'Logs', icon: Activity },
            { id: 'history', label: 'Histórico', icon: History },
            { id: 'queue', label: 'Fila de Trabalho', icon: List },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-4 px-2 border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'alerts' && <AlertConfig />}

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

      {activeTab === 'history' && (
        <div className="space-y-6">
          <HistoryFilters />
          <HistoryTimeline />
        </div>
      )}

      {activeTab === 'queue' && <FilaTrabalho />}
    </div>
  );
}
