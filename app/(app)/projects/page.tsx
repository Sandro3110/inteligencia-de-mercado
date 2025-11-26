'use client';
export const dynamic = 'force-dynamic';

/**
 * Página de Projetos
 * Usa o componente ProjectsTab completo com CRUD
 */

import { useRouter } from 'next/navigation';
import { ProjectsTab } from '@/components/projects/ProjectsTabAdapted';

export default function ProjectsPage() {
  const router = useRouter();

  const handleShowHistory = (projectId: number) => {
    // Navegar para página de histórico do projeto
    router.push(`/projects/${projectId}/history`);
  };

  return (
    <div className="h-full overflow-auto">
      <ProjectsTab onShowHistory={handleShowHistory} />
    </div>
  );
}
