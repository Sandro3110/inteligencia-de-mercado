'use client';

import { useState } from 'react';
import { useProject } from '@/lib/contexts/ProjectContext';
import { trpc } from '@/lib/trpc/client';
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Globe,
  FileText,
  Building2,
  BarChart3,
  Bell,
} from 'lucide-react';
import dynamic from 'next/dynamic';

const EvolutionCharts = dynamic(() => import('@/components/EvolutionCharts'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-lg" />,
});
const NotificationPanel = dynamic(() => import('@/components/NotificationPanel'), { ssr: false });
const NotificationFilters = dynamic(() => import('@/components/NotificationFilters'), { ssr: false });

export default function DashboardPage() {
  const { selectedProjectId } = useProject();
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'notifications'>('overview');

  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery(
    selectedProjectId ? { projectId: selectedProjectId } : undefined,
    { enabled: !!selectedProjectId }
  );

  const statsData = (stats as any) || {};

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <LayoutDashboard className="w-8 h-8 text-blue-600" />
          Dashboard
        </h1>
        <p className="text-gray-600">Visão geral do sistema e métricas principais</p>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-8">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'notifications', label: 'Notificações', icon: Bell },
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

      {activeTab === 'overview' && (
        <>
          {!selectedProjectId ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <LayoutDashboard className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-700">Selecione um projeto</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {[
                  { label: 'Projetos', value: statsData.projects, icon: FileText, color: 'blue' },
                  { label: 'Pesquisas', value: statsData.pesquisas, icon: FileText, color: 'purple' },
                  { label: 'Mercados', value: statsData.mercados, icon: Globe, color: 'green' },
                  { label: 'Leads', value: statsData.leads, icon: Users, color: 'yellow' },
                  { label: 'Clientes', value: statsData.clientes, icon: Building2, color: 'indigo' },
                  { label: 'Concorrentes', value: statsData.concorrentes, icon: TrendingUp, color: 'red' },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                          <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        {isLoading ? '-' : stat.value || 0}
                      </h3>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Evolução Temporal</h2>
                <EvolutionCharts runId={selectedProjectId} />
              </div>
            </>
          )}
        </>
      )}

      {activeTab === 'analytics' && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Avançado</h3>
          <p className="text-gray-600">Análises detalhadas e métricas avançadas</p>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <NotificationFilters />
          <NotificationPanel />
        </div>
      )}
    </div>
  );
}
