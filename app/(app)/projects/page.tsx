'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { FolderKanban, Search, Plus } from 'lucide-react';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { ProjectModal } from '@/components/projects/ProjectModal';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function ProjectsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<{
    id: number;
    nome: string;
    descricao: string;
    cor: string;
  } | null>(null);

  const trpcUtils = trpc.useUtils();

  // Queries
  const { data: projects, isLoading } = trpc.dashboard.getProjects.useQuery();

  // Mutations
  const createMutation = trpc.projects.create.useMutation({
    onSuccess: () => {
      toast.success('Projeto criado com sucesso!');
      setIsCreateModalOpen(false);
      trpcUtils.dashboard.getProjects.invalidate();
      trpcUtils.dashboard.stats.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao criar projeto: ${error.message}`);
    },
  });

  const updateMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      toast.success('Projeto atualizado com sucesso!');
      setEditingProject(null);
      trpcUtils.dashboard.getProjects.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar projeto: ${error.message}`);
    },
  });

  const deleteMutation = trpc.projects.deleteEmpty.useMutation({
    onSuccess: () => {
      toast.success('Projeto excluído com sucesso!');
      trpcUtils.dashboard.getProjects.invalidate();
      trpcUtils.dashboard.stats.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir projeto: ${error.message}`);
    },
  });

  // Handlers
  const handleCreate = (data: {
    nome: string;
    descricao: string;
    cor: string;
    nomePesquisa?: string;
  }) => {
    createMutation.mutate(data);
  };

  const handleUpdate = (data: { nome: string; descricao: string; cor: string }) => {
    if (!editingProject) return;
    updateMutation.mutate({
      id: editingProject.id,
      ...data,
    });
  };

  const handleView = (id: number) => {
    router.push(`/projects/${id}`);
  };

  const handleEdit = (id: number) => {
    const project = projects?.find((p) => p.id === id);
    if (project) {
      setEditingProject({
        id: project.id,
        nome: project.nome,
        descricao: project.descricao || '',
        cor: '#3b82f6', // Default color since it's not in the query
      });
    }
  };

  const handleDelete = (id: number) => {
    const project = projects?.find((p) => p.id === id);
    if (!project) return;

    if (
      confirm(
        `Tem certeza que deseja excluir o projeto "${project.nome}"?\n\nIsso excluirá TODAS as pesquisas e dados associados. Esta ação não pode ser desfeita.`
      )
    ) {
      deleteMutation.mutate({ id });
    }
  };

  // Filtrar projetos pela busca
  const filteredProjects = projects?.filter(
    (project) =>
      project.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.descricao?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <FolderKanban className="w-8 h-8 text-blue-600" />
          Projetos
        </h1>
        <p className="text-gray-600">Gerencie seus projetos de inteligência de mercado</p>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Buscar projetos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Novo Projeto
        </button>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-200 animate-pulse h-48 rounded-lg" />
          ))}
        </div>
      ) : filteredProjects && filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : searchQuery ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-700 mb-2">Nenhum projeto encontrado</p>
          <p className="text-gray-600">Tente buscar com outros termos ou crie um novo projeto</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FolderKanban className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-700 mb-2">Você ainda não tem projetos</p>
          <p className="text-gray-600 mb-4">
            Crie seu primeiro projeto para começar a organizar suas pesquisas
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Criar Primeiro Projeto
          </button>
        </div>
      )}

      {/* Modals */}
      <ProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
      />

      {editingProject && (
        <ProjectModal
          isOpen={true}
          onClose={() => setEditingProject(null)}
          onSubmit={handleUpdate}
          initialData={editingProject}
          isLoading={updateMutation.isPending}
        />
      )}
    </div>
  );
}
