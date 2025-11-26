'use client';
export const dynamic = 'force-dynamic';

/**
 * Página de Projetos
 * Lista projetos usando tRPC e reage ao projeto selecionado globalmente
 */

import { useProject } from '@/lib/contexts/ProjectContext';
import { trpc } from '@/lib/trpc/client';

export default function ProjectsPage() {
  const { selectedProjectId } = useProject();
  const { data: projects, isLoading } = trpc.projects.list.useQuery();

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Projetos</h1>
        <p>Carregando projetos...</p>
      </div>
    );
  }

  // Filtrar pelo projeto selecionado se houver
  const filteredProjects = selectedProjectId
    ? projects?.filter(p => p.id === selectedProjectId)
    : projects;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Projetos</h1>
        <p className="text-gray-600 mt-1">
          Gerencie seus projetos de inteligência de mercado
        </p>
        
        {/* Indicador de filtro */}
        {selectedProjectId && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg inline-block">
            <p className="text-sm text-blue-800">
              🔍 Filtrando por projeto selecionado globalmente
            </p>
          </div>
        )}
      </div>

      {filteredProjects && filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center space-x-2 mb-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: project.cor || '#3b82f6' }}
                />
                <h3 className="font-bold text-lg">{project.nome}</h3>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                {project.descricao || 'Sem descrição'}
              </p>
              <div className="text-xs text-gray-500">
                ID: {project.id} | Criado em {project.createdAt ? new Date(project.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <p className="text-gray-600">
            {selectedProjectId 
              ? 'Projeto selecionado não encontrado' 
              : 'Nenhum projeto encontrado'}
          </p>
        </div>
      )}

      {/* Debug Info */}
      <div className="mt-8 bg-gray-100 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">🔍 Debug - Reatividade:</h4>
        <pre className="text-xs text-gray-600">
          {JSON.stringify({
            selectedProjectId,
            totalProjects: projects?.length || 0,
            filteredProjects: filteredProjects?.length || 0,
            message: 'Esta página REAGE ao projeto selecionado no Dashboard'
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
