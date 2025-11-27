'use client';

import { useProject } from '@/lib/contexts/ProjectContext';
import { trpc } from '@/lib/trpc/client';
import { FileText, Calendar, Mail, ToggleLeft, ToggleRight } from 'lucide-react';

export default function ReportsPage() {
  const { selectedProjectId } = useProject();
  
  // Buscar agendamentos de relatórios
  const { data: schedules, isLoading } = trpc.reports.listSchedules.useQuery({
    projectId: selectedProjectId || undefined,
  });

  if (!selectedProjectId) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Relatórios</h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
          <p className="text-lg font-medium text-yellow-900">Selecione um projeto</p>
          <p className="text-sm text-yellow-700 mt-2">
            Para visualizar relatórios, selecione um projeto no seletor global
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Relatórios</h1>
        <p className="text-gray-600">Agendamentos e automação de relatórios</p>
      </div>

      {/* Lista de Agendamentos */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold">Agendamentos de Relatórios</h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            + Novo Agendamento
          </button>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Carregando agendamentos...</p>
          </div>
        ) : schedules && schedules.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{schedule.name}</h3>
                      {schedule.active === 1 ? (
                        <ToggleRight className="w-6 h-6 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span>{schedule.reportType}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{schedule.frequency}</span>
                      </div>
                      {schedule.recipients && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <span>{schedule.recipients.split(',').length} destinatário(s)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    schedule.active === 1 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {schedule.active === 1 ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                {/* Datas de Execução */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Última Execução</p>
                    <p className="font-medium text-gray-900">
                      {schedule.lastRun 
                        ? new Date(schedule.lastRun).toLocaleString('pt-BR')
                        : 'Nunca executado'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Próxima Execução</p>
                    <p className="font-medium text-gray-900">
                      {schedule.nextRun 
                        ? new Date(schedule.nextRun).toLocaleString('pt-BR')
                        : 'Não agendado'}
                    </p>
                  </div>
                </div>

                {/* Destinatários */}
                {schedule.recipients && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Destinatários:</p>
                    <div className="flex flex-wrap gap-2">
                      {schedule.recipients.split(',').map((email, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                        >
                          {email.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ações */}
                <div className="mt-4 flex items-center gap-2">
                  <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors">
                    Editar
                  </button>
                  <button className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded transition-colors">
                    Executar Agora
                  </button>
                  <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors">
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 text-lg font-medium">Nenhum agendamento encontrado</p>
            <p className="text-gray-500 text-sm mt-2">
              Crie um novo agendamento para automatizar seus relatórios
            </p>
            <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Criar Primeiro Agendamento
            </button>
          </div>
        )}
      </div>

      {/* Tipos de Relatórios Disponíveis */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold mb-4">Tipos de Relatórios Disponíveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
            <h3 className="font-semibold text-gray-900 mb-2">Relatório Executivo</h3>
            <p className="text-sm text-gray-600">Visão geral com principais métricas e KPIs</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
            <h3 className="font-semibold text-gray-900 mb-2">Relatório de Leads</h3>
            <p className="text-sm text-gray-600">Análise detalhada de leads e conversões</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
            <h3 className="font-semibold text-gray-900 mb-2">Relatório de Mercados</h3>
            <p className="text-sm text-gray-600">Mapeamento e análise de mercados</p>
          </div>
        </div>
      </div>
    </div>
  );
}
