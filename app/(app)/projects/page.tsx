'use client';
export const dynamic = 'force-dynamic';

/**
 * Página de Projetos
 * Lista projetos usando tRPC
 */

import { trpc } from '@/lib/trpc/client';

export default function ProjectsPage() {
  const { data: projects, isLoading } = trpc.projects.list.useQuery();

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Projetos</h1>
        <p>Carregando projetos...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Projetos</h1>
        <p className="text-gray-600 mt-1">
          Gerencie seus projetos de inteligência de mercado
        </p>
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
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
                Criado em {project.createdAt ? new Date(project.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <p className="text-gray-600">Nenhum projeto encontrado</p>
        </div>
      )}
    </div>
  );
}
