'use client';

import { Zap, BarChart3, Download, FileText } from 'lucide-react';
import { GenerateReportButton } from '@/components/enrichment-v3/GenerateReportButton';

interface PesquisaCardProps {
  pesquisa: {
    id: number;
    projectId: number;
    nome: string;
    descricao: string | null;
    totalClientes: number;
    clientesEnriquecidos: number;
    status: string;
    leadsCount: number;
    mercadosCount: number;
    concorrentesCount: number;
  };
  onEnrich: (projectId: number, pesquisaId: number) => void;
  onViewResults: (projectId: number, pesquisaId: number) => void;
  onExport: (projectId: number, pesquisaId: number) => void;
}

export function PesquisaCard({ pesquisa, onEnrich, onViewResults, onExport }: PesquisaCardProps) {
  // Calcular progresso de enriquecimento de clientes
  const clientesPercentage =
    pesquisa.totalClientes > 0
      ? Math.round((pesquisa.clientesEnriquecidos / pesquisa.totalClientes) * 100)
      : 0;

  // Estimativa de progresso geral baseado em todas as entidades
  // Considera que cada entidade contribui para o progresso total
  const hasLeads = pesquisa.leadsCount > 0;
  const hasMercados = pesquisa.mercadosCount > 0;
  const hasConcorrentes = pesquisa.concorrentesCount > 0;

  // Progresso geral: média ponderada
  // - Clientes: 40% (base principal)
  // - Leads: 30% (se houver)
  // - Mercados: 20% (se houver)
  // - Concorrentes: 10% (se houver)
  let overallProgress = clientesPercentage * 0.4;
  if (hasLeads) overallProgress += 30;
  if (hasMercados) overallProgress += 20;
  if (hasConcorrentes) overallProgress += 10;

  const enrichmentPercentage = Math.min(100, Math.round(overallProgress));

  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
      <h4 className="text-lg font-bold text-gray-900 mb-2">{pesquisa.nome}</h4>
      <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
        {pesquisa.descricao || 'Sem descrição'}
      </p>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Progresso Geral</span>
          <span className="font-semibold text-gray-900">{enrichmentPercentage}%</span>
        </div>
        <div
          className="w-full bg-gray-200 rounded-full h-2 cursor-help"
          title={`Clientes: ${pesquisa.clientesEnriquecidos}/${pesquisa.totalClientes} (${clientesPercentage}%) | Leads: ${pesquisa.leadsCount} | Mercados: ${pesquisa.mercadosCount} | Concorrentes: ${pesquisa.concorrentesCount}`}
        >
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${enrichmentPercentage}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Clientes: {pesquisa.clientesEnriquecidos}/{pesquisa.totalClientes} ({clientesPercentage}%)
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm mb-4">
        <div className="text-center">
          <div className="font-bold text-gray-900">{pesquisa.totalClientes}</div>
          <div className="text-gray-600 text-xs">Clientes</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-gray-900">{pesquisa.leadsCount}</div>
          <div className="text-gray-600 text-xs">Leads</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-gray-900">{pesquisa.mercadosCount}</div>
          <div className="text-gray-600 text-xs">Mercados</div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onEnrich(pesquisa.projectId, pesquisa.id)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          title="Enriquecer"
        >
          <Zap className="w-4 h-4" />
          Enriquecer
        </button>
        <GenerateReportButton pesquisaId={pesquisa.id} size="sm" />
        <button
          onClick={() => onViewResults(pesquisa.projectId, pesquisa.id)}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          title="Ver Resultados"
        >
          <BarChart3 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onExport(pesquisa.projectId, pesquisa.id)}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          title="Exportar"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
