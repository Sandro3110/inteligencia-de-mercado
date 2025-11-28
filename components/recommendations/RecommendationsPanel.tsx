'use client';

import { useApp } from '@/lib/contexts/AppContext';
import { trpc } from '@/lib/trpc/client';
import { Lightbulb, Star } from 'lucide-react';

export default function RecommendationsPanel() {
  const { selectedProjectId } = useApp();
  const { data: recs } = trpc.recommendations.list.useQuery({ projectId: selectedProjectId! }, { enabled: !!selectedProjectId });

  if (!selectedProjectId) return <div className="p-8 text-center text-gray-600">Selecione um projeto</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-3"><Lightbulb className="w-8 h-8 text-yellow-600" />Recomendações Inteligentes</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        {recs && recs.length > 0 ? (
          <div className="space-y-4">{recs.map((rec: any) => (
            <div key={rec.id} className="p-4 bg-gradient-to-r from-yellow-50 to-white rounded-lg border border-yellow-200">
              <div className="flex items-start gap-3">
                <Star className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{rec.type}</h3>
                  <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">Prioridade: {rec.priority}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}</div>
        ) : <p className="text-center text-gray-500 py-12">Nenhuma recomendação disponível no momento</p>}
      </div>
    </div>
  );
}
