'use client';

import { useApp } from '@/lib/contexts/AppContext';
import { trpc } from '@/lib/trpc/client';
import { Sparkles, TrendingUp, Clock } from 'lucide-react';

export default function EnrichmentPanel() {
  const { selectedProjectId } = useApp();
  const { data: stats } = trpc.enrichment.stats.useQuery({ projectId: selectedProjectId! }, { enabled: !!selectedProjectId });
  const { data: jobs } = trpc.enrichment.listJobs.useQuery({ projectId: selectedProjectId!, limit: 10 }, { enabled: !!selectedProjectId });

  if (!selectedProjectId) return <div className="p-8 text-center text-gray-600">Selecione um projeto</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-3"><Sparkles className="w-8 h-8 text-purple-600" />Enriquecimento de Dados</h1>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border"><p className="text-sm text-gray-600">Total de Jobs</p><p className="text-3xl font-bold">{stats?.totalJobs || 0}</p></div>
        <div className="bg-white p-6 rounded-lg shadow-sm border"><p className="text-sm text-gray-600">Na Fila</p><p className="text-3xl font-bold text-orange-600">{stats?.pendingQueue || 0}</p></div>
        <div className="bg-white p-6 rounded-lg shadow-sm border"><p className="text-sm text-gray-600">Concluídos</p><p className="text-3xl font-bold text-green-600">{stats?.completed || 0}</p></div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Jobs Recentes</h2>
        {jobs && jobs.length > 0 ? (
          <div className="space-y-3">{jobs.map((job: any) => (
            <div key={job.id} className="p-4 bg-gray-50 rounded-lg border">
              <div className="flex justify-between"><span className="font-medium">{job.entityType}</span><span className="text-sm text-gray-600">{new Date(job.createdAt).toLocaleString('pt-BR')}</span></div>
            </div>
          ))}</div>
        ) : <p className="text-center text-gray-500 py-8">Nenhum job encontrado</p>}
      </div>
    </div>
  );
}
