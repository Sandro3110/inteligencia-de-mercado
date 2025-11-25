'use client';

import { ProjectsTab } from '@/components/tabs/ProjectsTab';
import { useSelectedProject } from '@/hooks/useSelectedProject';

export default function ProjectsPage() {
  const { selectedProjectId } = useSelectedProject();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Projetos</h1>
        <p className="text-gray-600 mt-1">
          Gerencie seus projetos de pesquisa de mercado
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <ProjectsTab />
      </div>
    </div>
  );
}
