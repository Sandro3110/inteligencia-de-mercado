'use client';

import { useState } from 'react';
import { useProject } from '@/lib/contexts/ProjectContext';
import { BarChart3, TrendingUp, Target, Activity } from 'lucide-react';
import dynamic from 'next/dynamic';

const OverviewTab = dynamic(() => import('@/components/analytics/OverviewTab'), { ssr: false });
const MetricsTab = dynamic(() => import('@/components/analytics/MetricsTab'), { ssr: false });
const ComparativeTab = dynamic(() => import('@/components/analytics/ComparativeTab'), { ssr: false });
const InteractiveTab = dynamic(() => import('@/components/analytics/InteractiveTab'), { ssr: false });

type TabType = 'overview' | 'metrics' | 'comparative' | 'interactive';

export default function AnalyticsPage() {
  const { selectedProjectId } = useProject();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  if (!selectedProjectId) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto text-center py-12">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Selecione um Projeto</h2>
          <p className="text-gray-600">Escolha um projeto no seletor global</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: Activity },
    { id: 'metrics', label: 'Métricas', icon: TrendingUp },
    { id: 'comparative', label: 'Comparativo', icon: Target },
    { id: 'interactive', label: 'Interativo', icon: BarChart3 },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Análises detalhadas e métricas do projeto</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && <OverviewTab projectId={selectedProjectId} />}
          {activeTab === 'metrics' && <MetricsTab projectId={selectedProjectId} />}
          {activeTab === 'comparative' && <ComparativeTab projectId={selectedProjectId} />}
          {activeTab === 'interactive' && <InteractiveTab projectId={selectedProjectId} />}
        </div>
      </div>
    </div>
  );
}
