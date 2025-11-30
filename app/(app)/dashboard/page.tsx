'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Globe,
  Users,
  Building2,
  ChevronDown,
} from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { PesquisaCard } from '@/components/dashboard/PesquisaCard';
import { toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // Carregar seleção do localStorage
  useEffect(() => {
    const initializeProject = () => {
      const saved = localStorage.getItem('selectedProjectId');
      if (saved && saved !== 'null') {
        setSelectedProjectId(parseInt(saved));
      }
    };
    initializeProject();
  }, []);

  // Salvar seleção no localStorage
  useEffect(() => {
    if (selectedProjectId !== null) {
      localStorage.setItem('selectedProjectId', selectedProjectId.toString());
    } else {
      localStorage.setItem('selectedProjectId', 'null');
    }
  }, [selectedProjectId]);

  // Queries
  const { data: globalStats, isLoading: loadingGlobalStats } = trpc.dashboard.stats.useQuery(
    undefined,
    { enabled: selectedProjectId === null }
  );

  const { data: projectStats, isLoading: loadingProjectStats } = trpc.dashboard.stats.useQuery(
    { projectId: selectedProjectId! },
    { enabled: selectedProjectId !== null }
  );

  const { data: projects, isLoading: loadingProjects } = trpc.dashboard.getProjects.useQuery(
    undefined,
    { enabled: selectedProjectId === null }
  );

  const {
    data: pesquisas,
    isLoading: loadingPesquisas,
    refetch: refetchPesquisas,
  } = trpc.dashboard.getProjectPesquisas.useQuery(
    { projectId: selectedProjectId! },
    { enabled: selectedProjectId !== null }
  );

  const stats = selectedProjectId === null ? globalStats : projectStats;
  const isLoading =
    selectedProjectId === null
      ? loadingGlobalStats || loadingProjects
      : loadingProjectStats || loadingPesquisas;

  // Mutations
  const deleteProjectMutation = trpc.projects.deleteEmpty.useMutation({
    onSuccess: () => {
      toast.success('Projeto excluído com sucesso');
      // Revalidar queries
      trpcUtils.dashboard.getProjects.invalidate();
      trpcUtils.dashboard.stats.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir projeto: ${error.message}`);
    },
  });

  const trpcUtils = trpc.useUtils();

  // Handlers
  const handleProjectSelect = (projectId: number | null) => {
    setSelectedProjectId(projectId);
  };

  const handleViewProject = (projectId: number) => {
    router.push(`/projects/${projectId}`);
  };

  const handleEditProject = (_projectId: number) => {
    // TODO: Abrir modal de edição
    toast.info('Modal de edição em desenvolvimento');
  };

  const handleDeleteProject = (projectId: number) => {
    if (
      confirm(
        'Tem certeza que deseja excluir este projeto? Isso excluirá TODAS as pesquisas e dados.'
      )
    ) {
      deleteProjectMutation.mutate({ id: projectId });
    }
  };

  const handleEnrich = (projectId: number, pesquisaId: number) => {
    router.push(`/projects/${projectId}/surveys/${pesquisaId}/enrich`);
  };

  const handleGeocode = async (_projectId: number, pesquisaId: number) => {
    try {
      toast.info('Iniciando geocodificação...');

      const result = await trpc.geo.startGeocoding.mutate({
        pesquisaId,
        userId: 'system', // TODO: pegar do contexto de autenticação
      });

      toast.success(result.message);

      // Iniciar processamento em lotes
      processGeocoding(result.jobId);
    } catch (error: any) {
      console.error('Erro ao iniciar geocodificação:', error);
      toast.error(error.message || 'Erro ao iniciar geocodificação');
    }
  };

  const processGeocoding = async (jobId: number) => {
    try {
      const result = await trpc.geo.processBatch.mutate({ jobId });

      if (!result.completed) {
        // Continuar processando próximo lote
        setTimeout(() => processGeocoding(jobId), 1000);
      } else {
        toast.success('Geocodificação concluída!');
        // Recarregar dados
        trpcUtils.dashboard.getProjectPesquisas.invalidate();
      }
    } catch (error: any) {
      console.error('Erro ao processar lote:', error);
      toast.error('Erro durante geocodificação');
    }
  };

  const handleViewResults = (projectId: number, pesquisaId: number) => {
    router.push(`/projects/${projectId}/surveys/${pesquisaId}/results`);
  };

  const handleExport = async (_projectId: number, pesquisaId: number) => {
    try {
      toast.info('Gerando arquivo Excel...');

      const response = await fetch(`/api/export/excel?pesquisaId=${pesquisaId}`);

      if (!response.ok) {
        throw new Error('Erro ao gerar Excel');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pesquisa_${pesquisaId}_completo.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Excel exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar Excel');
    }
  };

  // Encontrar projeto selecionado para mostrar nome
  const selectedProject = projects?.find((p) => p.id === selectedProjectId);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <LayoutDashboard className="w-8 h-8 text-blue-600" />
          Dashboard
        </h1>
        <p className="text-gray-600">Visão geral e métricas principais</p>
      </div>

      {/* Seletor de Projeto */}
      <div className="mb-6">
        <div className="relative inline-block">
          <select
            value={selectedProjectId || ''}
            onChange={(e) => handleProjectSelect(e.target.value ? parseInt(e.target.value) : null)}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-900 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">Todos os Projetos</option>
            {projects?.map((project) => (
              <option key={project.id} value={project.id}>
                {project.nome}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* KPIs */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-gray-200 animate-pulse h-32 rounded-lg" />
          ))}
        </div>
      ) : selectedProjectId === null ? (
        // KPIs Globais
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <KPICard title="Projetos" value={stats?.projects || 0} icon={FolderKanban} color="blue" />
          <KPICard title="Pesquisas" value={stats?.pesquisas || 0} icon={FileText} color="purple" />
          <KPICard title="Mercados" value={stats?.mercados || 0} icon={Globe} color="green" />
          <KPICard title="Leads" value={stats?.leads || 0} icon={Users} color="yellow" />
          <KPICard title="Clientes" value={stats?.clientes || 0} icon={Building2} color="indigo" />
        </div>
      ) : (
        // KPIs do Projeto
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard title="Pesquisas" value={stats?.pesquisas || 0} icon={FileText} color="purple" />
          <KPICard title="Mercados" value={stats?.mercados || 0} icon={Globe} color="green" />
          <KPICard title="Leads" value={stats?.leads || 0} icon={Users} color="yellow" />
          <KPICard title="Clientes" value={stats?.clientes || 0} icon={Building2} color="indigo" />
        </div>
      )}

      {/* Lista de Projetos ou Pesquisas */}
      {selectedProjectId === null ? (
        // Lista de Projetos
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Projetos</h2>
            <button
              onClick={() => router.push('/projects')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Novo Projeto
            </button>
          </div>

          {loadingProjects ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-200 animate-pulse h-48 rounded-lg" />
              ))}
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onView={handleViewProject}
                  onEdit={handleEditProject}
                  onDelete={handleDeleteProject}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <FolderKanban className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-700 mb-2">Você ainda não tem projetos</p>
              <p className="text-gray-600 mb-4">Crie seu primeiro projeto para começar</p>
              <button
                onClick={() => router.push('/projects')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Criar Primeiro Projeto
              </button>
            </div>
          )}
        </div>
      ) : (
        // Lista de Pesquisas do Projeto
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Pesquisas - {selectedProject?.nome}
            </h2>
            <button
              onClick={() => router.push(`/projects/${selectedProjectId}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Nova Pesquisa
            </button>
          </div>

          {loadingPesquisas ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-200 animate-pulse h-64 rounded-lg" />
              ))}
            </div>
          ) : pesquisas && pesquisas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pesquisas.map((pesquisa) => (
                <PesquisaCard
                  key={pesquisa.id}
                  pesquisa={pesquisa}
                  onEnrich={handleEnrich}
                  onGeocode={handleGeocode}
                  onViewResults={handleViewResults}
                  onExport={handleExport}
                  onRefresh={async () => {
                    await refetchPesquisas();
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Este projeto não tem pesquisas
              </p>
              <p className="text-gray-600 mb-4">Crie sua primeira pesquisa para começar</p>
              <button
                onClick={() => router.push(`/projects/${selectedProjectId}`)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Criar Primeira Pesquisa
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
