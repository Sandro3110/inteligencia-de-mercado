'use client';

import { useProject } from '@/lib/contexts/ProjectContext';
import { Zap, Play, CheckCircle, XCircle, Clock } from 'lucide-react';
import { EnrichmentProgress } from '@/components/EnrichmentProgress';

export default function EnrichmentPage() {
  const { selectedProjectId } = useProject();

  if (!selectedProjectId) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto text-center py-12">
          <Zap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Selecione um Projeto
          </h2>
          <p className="text-gray-600">
            Escolha um projeto no seletor global para gerenciar enriquecimentos
          </p>
        </div>
      </div>
    );
  }

  // Mock job para demonstração
  const mockJob = {
    id: 1,
    totalClients: 100,
    processedClients: 85,
    successCount: 80,
    errorCount: 5,
    startedAt: new Date().toISOString(),
  };

  const steps = [
    {
      id: 'init',
      label: 'Inicialização',
      status: 'completed' as const,
      message: 'Preparando job de enriquecimento',
    },
    {
      id: 'processing',
      label: 'Processamento',
      status: 'in_progress' as const,
      message: `Processando ${mockJob.totalClients} clientes`,
      progress: Math.round((mockJob.processedClients / mockJob.totalClients) * 100),
    },
    {
      id: 'finalization',
      label: 'Finalização',
      status: 'pending' as const,
      message: 'Aguardando conclusão',
    },
  ];

  const totalProgress = Math.round((mockJob.processedClients / mockJob.totalClients) * 100);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Enriquecimento</h1>
          <p className="text-gray-600">
            Gerencie jobs de enriquecimento de dados
          </p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
          <Play className="w-5 h-5" />
          Novo Job
        </button>
      </div>

      {/* Job de Demonstração */}
      <div className="bg-white rounded-lg shadow">
        {/* Header do Job */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-gray-900">
                  Job #{mockJob.id}
                </h3>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 animate-pulse">
                  <Clock className="w-3 h-3 inline mr-1" />
                  running
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Total: {mockJob.totalClients} clientes</span>
                <span>•</span>
                <span>Processados: {mockJob.processedClients}</span>
                <span>•</span>
                <span>Sucesso: {mockJob.successCount}</span>
                {mockJob.errorCount > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-red-600">Erros: {mockJob.errorCount}</span>
                  </>
                )}
              </div>
            </div>
            <Zap className="w-8 h-8 flex-shrink-0 text-blue-500 animate-pulse" />
          </div>
        </div>

        {/* Progress */}
        <div className="p-6">
          <EnrichmentProgress
            steps={steps}
            currentStep={1}
            totalProgress={totalProgress}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span>
            Iniciado: {new Date(mockJob.startedAt).toLocaleString('pt-BR')}
          </span>
          <span className="text-blue-600 font-medium">Em andamento...</span>
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-medium mb-1">💡 Demonstração</p>
        <p>Este é um job de exemplo. Integração com API de enriquecimento será implementada em breve.</p>
      </div>
    </div>
  );
}
