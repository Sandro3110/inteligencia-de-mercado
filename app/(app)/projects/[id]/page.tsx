'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { ArrowLeft, Plus, FileText, Zap, BarChart3, Download } from 'lucide-react';
import { PesquisaCard } from '@/components/dashboard/PesquisaCard';
import { FeedbackModal, FeedbackType } from '@/components/ui/FeedbackModal';
import { PesquisaModal } from '@/components/pesquisas/PesquisaModal';
import { EnrichAllModal } from '@/components/enrichment/EnrichAllModal';

export default function ProjectDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = parseInt(params.id as string);

  // Queries
  const { data: project, isLoading: loadingProject } = trpc.projects.getById.useQuery({
    id: projectId,
  });

  const {
    data: pesquisas,
    isLoading: loadingPesquisas,
    refetch: refetchPesquisas,
  } = trpc.dashboard.getProjectPesquisas.useQuery({ projectId });

  const isLoading = loadingProject || loadingPesquisas;

  // Estado do FeedbackModal
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('info');
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Handlers
  const handleEnrich = (projId: number, pesquisaId: number) => {
    router.push(`/projects/${projId}/surveys/${pesquisaId}/enrich`);
  };

  const handleViewResults = (projId: number, pesquisaId: number) => {
    router.push(`/projects/${projId}/surveys/${pesquisaId}/results`);
  };

  const handleGeocode = async (_projId: number, pesquisaId: number) => {
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

  const handleExport = async (_projId: number, pesquisaId: number) => {
    try {
      toast.info('Gerando arquivo Excel...');

      const response = await fetch(`/api/export/excel?pesquisaId=${pesquisaId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao gerar Excel');
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
      toast.error(error instanceof Error ? error.message : 'Erro ao exportar Excel');
    }
  };

  const [isCreatePesquisaModalOpen, setIsCreatePesquisaModalOpen] = useState(false);
  const [isEnrichAllModalOpen, setIsEnrichAllModalOpen] = useState(false);

  const trpcUtils = trpc.useUtils();

  const createPesquisaMutation = trpc.pesquisas.createWithCSV.useMutation({
    onSuccess: () => {
      toast.success('Pesquisa criada com sucesso!');
      setIsCreatePesquisaModalOpen(false);
      trpcUtils.dashboard.getProjectPesquisas.invalidate();
      trpcUtils.dashboard.stats.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao criar pesquisa: ${error.message}`);
    },
  });

  const handleNewPesquisa = () => {
    setIsCreatePesquisaModalOpen(true);
  };

  const _handleCreatePesquisa = (data: {
    nome: string;
    descricao: string;
    csvData: string[][];
  }) => {
    createPesquisaMutation.mutate({
      projectId,
      ...data,
    });
  };

  const handlePesquisaCreated = () => {
    setIsCreatePesquisaModalOpen(false);
    trpcUtils.dashboard.getProjectPesquisas.invalidate();
    trpcUtils.dashboard.stats.invalidate();
  };

  // Mutation para exportar projeto completo
  const exportProjectMutation = trpc.export.exportProjectExcel.useMutation({
    onSuccess: (data) => {
      // Converter base64 para blob e fazer download
      const blob = base64ToBlob(data.data, data.mimeType);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Projeto exportado com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao exportar: ${error.message}`);
    },
  });

  // Helper para converter base64 em blob
  const base64ToBlob = (base64: string, mimeType: string) => {
    if (!base64 || typeof base64 !== 'string') {
      throw new Error('Base64 inválido: esperado string, recebido ' + typeof base64);
    }

    let byteCharacters;
    try {
      byteCharacters = atob(base64);
    } catch (e) {
      console.error('Erro ao decodificar Base64:', e);
      throw new Error('Erro ao decodificar PDF: string Base64 inválida');
    }
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  const handleExportAll = () => {
    if (!pesquisas || pesquisas.length === 0) {
      toast.error('Não há pesquisas para exportar');
      return;
    }
    toast.loading('Exportando projeto...');
    exportProjectMutation.mutate({ projectId });
  };

  // Mutation para enriquecer todas as pesquisas
  const enrichAllMutation = trpc.enrichment.enrichAll.useMutation({
    onSuccess: (data) => {
      toast.success(`Enriquecimento iniciado para ${data.started} pesquisas!`);
      if (data.failed > 0) {
        toast.warning(`${data.failed} pesquisas falharam ao iniciar`);
      }
      setIsEnrichAllModalOpen(false);
      trpcUtils.dashboard.getProjectPesquisas.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao iniciar enriquecimento: ${error.message}`);
    },
  });

  const handleEnrichAll = () => {
    if (!pesquisas || pesquisas.length === 0) {
      toast.error('Não há pesquisas para enriquecer');
      return;
    }
    setIsEnrichAllModalOpen(true);
  };

  const handleConfirmEnrichAll = () => {
    enrichAllMutation.mutate({ projectId });
  };

  // Mutation para gerar relatório PDF
  const generateReportMutation = trpc.reports.generateProjectReport.useMutation({
    onSuccess: (data) => {
      // Converter base64 para blob e fazer download
      const blob = base64ToBlob(data.data, data.mimeType);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setFeedbackType('success');
      setFeedbackTitle('Relatório gerado com sucesso!');
      setFeedbackMessage(`O arquivo ${data.filename} foi baixado para seu computador.`);
      setShowFeedback(true);
    },
    onError: (error) => {
      setFeedbackType('error');
      setFeedbackTitle('Erro ao gerar relatório');
      setFeedbackMessage(error.message || 'Ocorreu um erro inesperado. Tente novamente.');
      setShowFeedback(true);
    },
  });

  const handleViewReport = () => {
    if (!pesquisas || pesquisas.length === 0) {
      setFeedbackType('error');
      setFeedbackTitle('Não há dados');
      setFeedbackMessage('Crie pelo menos uma pesquisa antes de gerar o relatório.');
      setShowFeedback(true);
      return;
    }

    setFeedbackType('info');
    setFeedbackTitle('Gerando relatório...');
    setFeedbackMessage('Aguarde enquanto geramos o relatório analítico com IA.');
    setShowFeedback(true);

    generateReportMutation.mutate({ projectId });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-96 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 h-64 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-lg font-medium text-gray-700">Projeto não encontrado</p>
          <button
            onClick={() => router.push('/projects')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Voltar para Projetos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/projects')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar para Projetos
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.nome}</h1>
        {project.descricao && <p className="text-gray-600">{project.descricao}</p>}
      </div>

      {/* Project Info Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-gray-600 mb-1">Status</div>
            <div className="font-semibold text-gray-900 capitalize">{project.status}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Criado em</div>
            <div className="font-semibold text-gray-900">
              {new Date(project.createdAt).toLocaleDateString('pt-BR')}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Última atualização</div>
            <div className="font-semibold text-gray-900">
              {new Date(project.updatedAt).toLocaleDateString('pt-BR')}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Total de pesquisas</div>
            <div className="font-semibold text-gray-900">{pesquisas?.length || 0}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleEnrichAll}
            disabled={!pesquisas || pesquisas.length === 0}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap className="w-4 h-4 text-blue-600" />
            <span>Enriquecer Todas</span>
          </button>
          <button
            onClick={handleViewReport}
            disabled={!pesquisas || pesquisas.length === 0 || generateReportMutation.isPending}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>
              {generateReportMutation.isPending ? 'Gerando...' : 'Ver Relatório Consolidado'}
            </span>
          </button>
          <button
            onClick={handleExportAll}
            disabled={!pesquisas || pesquisas.length === 0 || exportProjectMutation.isPending}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>{exportProjectMutation.isPending ? 'Exportando...' : 'Exportar Tudo'}</span>
          </button>
        </div>
      </div>

      {/* Pesquisas Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Pesquisas</h2>
          <button
            onClick={handleNewPesquisa}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Nova Pesquisa
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
            <p className="text-lg font-medium text-gray-700 mb-2">Este projeto não tem pesquisas</p>
            <p className="text-gray-600 mb-4">
              Crie sua primeira pesquisa para começar a coletar dados
            </p>
            <button
              onClick={handleNewPesquisa}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Criar Primeira Pesquisa
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <FeedbackModal
        open={showFeedback}
        onClose={() => setShowFeedback(false)}
        type={feedbackType}
        title={feedbackTitle}
        message={feedbackMessage}
      />

      <PesquisaModal
        isOpen={isCreatePesquisaModalOpen}
        onClose={() => setIsCreatePesquisaModalOpen(false)}
        projectId={projectId}
        onSuccess={handlePesquisaCreated}
      />

      <EnrichAllModal
        isOpen={isEnrichAllModalOpen}
        onClose={() => setIsEnrichAllModalOpen(false)}
        onConfirm={handleConfirmEnrichAll}
        pesquisas={pesquisas || []}
        isLoading={enrichAllMutation.isPending}
      />
    </div>
  );
}
