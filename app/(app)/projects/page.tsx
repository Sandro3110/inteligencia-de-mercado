'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectsTab } from '@/components/projects/ProjectsTabAdapted';
import { FolderKanban, Activity, FileText, Search, Filter } from 'lucide-react';
import nextDynamic from 'next/dynamic';

const ActivityTab = nextDynamic(() => import('@/components/projects/ActivityTab'), { ssr: false });
const LogsTab = nextDynamic(() => import('@/components/projects/LogsTab'), { ssr: false });
const PesquisaSelector = nextDynamic(() => import('@/components/PesquisaSelector'), { ssr: false });
const SearchFieldSelector = nextDynamic(() => import('@/components/SearchFieldSelector'), { ssr: false });
const MultiSelectFilter = nextDynamic(() => import('@/components/MultiSelectFilter'), { ssr: false });

type TabType = 'projects' | 'activity' | 'logs' | 'search' | 'filters';

export default function ProjectsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('projects');

  const handleShowHistory = (projectId: number) => {
    router.push(`/projects/${projectId}/history`);
  };

  const tabs = [
    { id: 'projects', label: 'Projetos', icon: FolderKanban },
    { id: 'activity', label: 'Atividades', icon: Activity },
    { id: 'logs', label: 'Logs', icon: FileText },
    { id: 'search', label: 'Busca Avançada', icon: Search },
    { id: 'filters', label: 'Filtros', icon: Filter },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Projetos</h1>
        <p className="text-gray-600">Gerencie seus projetos e acompanhe atividades</p>
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
          {activeTab === 'projects' && <ProjectsTab onShowHistory={handleShowHistory} />}
          {activeTab === 'activity' && <ActivityTab />}
          {activeTab === 'logs' && <LogsTab />}
          {activeTab === 'search' && (
            <div className="space-y-6">
              <PesquisaSelector />
              <SearchFieldSelector />
            </div>
          )}
          {activeTab === 'filters' && <MultiSelectFilter />}
        </div>
      </div>
    </div>
  );
}
