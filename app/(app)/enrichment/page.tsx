'use client';

import { useProject } from '@/lib/contexts/ProjectContext';
import { trpc } from '@/lib/trpc/client';
import { Sparkles, Play, Pause, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function EnrichmentPage() {
  const { selectedProjectId } = useProject();
  
  // Buscar jobs de enriquecimento
  const { data: jobs, isLoading: loadingJobs } = trpc.enrichment.listJobs.useQuery({
    projectId: selectedProjectId || undefined,
    limit: 50,
  });

  // Buscar estatísticas
  const { data: stats } = trpc.enrichment.getStats.useQuery(
    { projectId: selectedProjectId! },
    { enabled: !!selectedProjectId }
  );

  if (!selectedProjectId) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Enriquecimento de Dados</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
          <p className="text-lg font-medium text-yellow-900">Selecione um projeto</p>
          <p className="text-sm text-yellow-700 mt-2">
            Para visualizar jobs de enriquecimento, selecione um projeto no seletor global
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Enriquecimento de Dados</h1>
        <p className="text-gray-600">Automatize o enriquecimento de leads com dados externos</p>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total</span>
              <Sparkles className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>

          <div className="bg-yellow-50 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-yellow-700">Pendentes</span>
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
          </div>

          <div className="bg-blue-50 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-700">Em Execução</span>
              <Play className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-blue-900">{stats.running}</p>
          </div>

          <div className="bg-green-50 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-green-700">Concluídos</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
          </div>

          <div className="bg-red-50 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-red-700">Falhas</span>
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-900">{stats.failed}</p>
          </div>
        </div>
      )}

      {/* Lista de Jobs */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold">Jobs de Enriquecimento</h2>
        </div>

        {loadingJobs ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Carregando jobs...</p>
          </div>
        ) : jobs && jobs.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {jobs.map((job) => {
              const progress = job.totalRecords > 0 
                ? Math.round((job.processedRecords / job.totalRecords) * 100) 
                : 0;

              return (
                <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Job #{job.id} - {job.type}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Criado em {new Date(job.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    
                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      job.status === 'completed' ? 'bg-green-100 text-green-800' :
                      job.status === 'running' ? 'bg-blue-100 text-blue-800' :
                      job.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {job.status === 'completed' ? 'Concluído' :
                       job.status === 'running' ? 'Em Execução' :
                       job.status === 'failed' ? 'Falhou' :
                       'Pendente'}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {job.totalRecords > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progresso</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            job.status === 'completed' ? 'bg-green-500' :
                            job.status === 'running' ? 'bg-blue-500' :
                            job.status === 'failed' ? 'bg-red-500' :
                            'bg-yellow-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Estatísticas do Job */}
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Total</p>
                      <p className="font-semibold text-gray-900">{job.totalRecords}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Processados</p>
                      <p className="font-semibold text-blue-600">{job.processedRecords}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Sucesso</p>
                      <p className="font-semibold text-green-600">{job.successfulRecords}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Falhas</p>
                      <p className="font-semibold text-red-600">{job.failedRecords}</p>
                    </div>
                  </div>

                  {/* Prioridade */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-gray-500">Prioridade:</span>
                    <div className="flex gap-1">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-4 rounded ${
                            i < job.priority ? 'bg-blue-500' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-gray-700">{job.priority}/10</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 text-lg font-medium">Nenhum job encontrado</p>
            <p className="text-gray-500 text-sm mt-2">
              Crie um novo job de enriquecimento para começar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
