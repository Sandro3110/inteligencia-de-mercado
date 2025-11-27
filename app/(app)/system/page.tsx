'use client';

import { Settings, Bell, FileText, Activity, History, List, Mail } from 'lucide-react';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const AlertConfig = dynamic(() => import('@/components/AlertConfig'), { ssr: false });
const HistoryTimeline = dynamic(() => import('@/components/HistoryTimeline'), { ssr: false });
const HistoryFilters = dynamic(() => import('@/components/HistoryFilters'), { ssr: false });
const FilaTrabalho = dynamic(() => import('@/components/FilaTrabalho'), { ssr: false });

export default function SystemPage() {
  const [activeTab, setActiveTab] = useState<'alerts' | 'settings' | 'logs' | 'history' | 'queue'>(
    'alerts'
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Settings className="w-8 h-8 text-blue-600" />
          Sistema
        </h1>
        <p className="text-gray-600">Configurações, alertas e monitoramento do sistema</p>
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
        <div className="space-y-6">
          {/* Configurações de Email */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Configurações de Email
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de Notificações
                </label>
                <input
                  type="email"
                  value="contato@intelmarket.app"
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email configurado para receber notificações de novos cadastros
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provedor de Email
                </label>
                <input
                  type="text"
                  value="Resend"
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Configurações de Autenticação */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-600" />
              Autenticação
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provedor de Autenticação
                </label>
                <input
                  type="text"
                  value="Supabase Auth"
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aprovação de Usuários
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked
                    disabled
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    Requer aprovação manual de administrador
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Configurações do Banco de Dados */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Banco de Dados
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Provedor</label>
                <input
                  type="text"
                  value="PostgreSQL (Supabase)"
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ORM</label>
                <input
                  type="text"
                  value="Drizzle ORM"
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Informações do Sistema */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              📝 <strong>Nota:</strong> Configurações avançadas devem ser gerenciadas via variáveis
              de ambiente (.env)
            </p>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-6">
          {/* Filtros de Logs */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Filtros
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Log</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option>Todos</option>
                  <option>Autenticação</option>
                  <option>Aprovações</option>
                  <option>Projetos</option>
                  <option>Pesquisas</option>
                  <option>Mercados</option>
                  <option>Leads</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nível</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option>Todos</option>
                  <option>Info</option>
                  <option>Warning</option>
                  <option>Error</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option>Últimas 24h</option>
                  <option>Últimos 7 dias</option>
                  <option>Últimos 30 dias</option>
                  <option>Personalizado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Logs */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                Logs Recentes
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {/* Log de exemplo */}
              <div className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                        INFO
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        Usuário aprovado com sucesso
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Usuário CHRISTIANNE MATIAS BUSSO foi aprovado pelo administrador
                    </p>
                    <p className="text-xs text-gray-500 mt-1">27/11/2025, 15:30:45</p>
                  </div>
                </div>
              </div>

              <div className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        INFO
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        Novo cadastro recebido
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Sandro dos Santos se cadastrou e aguarda aprovação
                    </p>
                    <p className="text-xs text-gray-500 mt-1">27/11/2025, 16:47:23</p>
                  </div>
                </div>
              </div>

              <div className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                        INFO
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        Email de notificação enviado
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Email enviado para contato@intelmarket.app sobre novo cadastro
                    </p>
                    <p className="text-xs text-gray-500 mt-1">27/11/2025, 16:47:25</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nota */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              📝 <strong>Nota:</strong> Logs detalhados podem ser visualizados no Vercel Dashboard
              ou via integração com ferramentas de monitoramento.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
          <HistoryFilters onFilterChange={() => {}} onExportCSV={() => {}} onExportPDF={() => {}} />
          <HistoryTimeline history={[]} />
        </div>
      )}

      {activeTab === 'queue' && <FilaTrabalho />}
    </div>
  );
}
