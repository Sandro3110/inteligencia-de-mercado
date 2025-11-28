'use client';

import { useApp } from '@/lib/contexts/AppContext';
import { trpc } from '@/lib/trpc/client';
import { FileText, Download, Calendar } from 'lucide-react';

export default function ReportsPanel() {
  const { selectedProjectId } = useApp();
  const { data: schedules } = trpc.reports.listSchedules.useQuery({ projectId: selectedProjectId! }, { enabled: !!selectedProjectId });
  const { data: history } = trpc.reports.exportHistory.useQuery({ projectId: selectedProjectId!, limit: 10 }, { enabled: !!selectedProjectId });

  if (!selectedProjectId) return <div className="p-8 text-center text-gray-600">Selecione um projeto</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-3"><FileText className="w-8 h-8 text-indigo-600" />Relatórios e Exportação</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Agendamentos Ativos</h2>
        {schedules && schedules.length > 0 ? (
          <div className="space-y-3">{schedules.map((sched: any) => (
            <div key={sched.id} className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">{sched.name}</h3>
                    <p className="text-sm text-gray-600">Frequência: {sched.frequency} | Formato: {sched.format}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs ${sched.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {sched.enabled ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          ))}</div>
        ) : <p className="text-center text-gray-500 py-8">Nenhum agendamento configurado</p>}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Histórico de Exportações</h2>
        {history && history.length > 0 ? (
          <div className="space-y-3">{history.map((exp: any) => (
            <div key={exp.id} className="p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">{exp.exportType}</p>
                    <p className="text-sm text-gray-600">{new Date(exp.createdAt).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}</div>
        ) : <p className="text-center text-gray-500 py-8">Nenhuma exportação realizada</p>}
      </div>
    </div>
  );
}
