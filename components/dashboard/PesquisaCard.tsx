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
  // ===== CÁLCULO DE METAS BASEADO NOS PROMPTS =====
  // Baseado em openaiLayered.ts:
  // - 2 mercados por cliente
  // - 8-10 concorrentes por mercado (~9 média) = 18 por cliente
  // - 5-8 leads por mercado (~6.5 média) = 13 por cliente
  // - ~4 produtos por cliente (estimativa)

  const totalClientes = pesquisa.totalClientes;
  const metaMercados = totalClientes * 2;
  const metaProdutos = totalClientes * 4;
  const metaLeads = totalClientes * 13;
  const metaConcorrentes = totalClientes * 18;

  // ===== CÁLCULO DE PROGRESSO INDIVIDUAL =====
  const clientesPercentage =
    totalClientes > 0 ? Math.round((pesquisa.clientesEnriquecidos / totalClientes) * 100) : 0;

  const mercadosPercentage =
    metaMercados > 0 ? Math.min(100, Math.round((pesquisa.mercadosCount / metaMercados) * 100)) : 0;

  const leadsPercentage =
    metaLeads > 0 ? Math.min(100, Math.round((pesquisa.leadsCount / metaLeads) * 100)) : 0;

  const concorrentesPercentage =
    metaConcorrentes > 0
      ? Math.min(100, Math.round((pesquisa.concorrentesCount / metaConcorrentes) * 100))
      : 0;

  // ===== PROGRESSO GERAL (MÉDIA PONDERADA) =====
  const overallProgress = Math.round(
    clientesPercentage * 0.4 +
      mercadosPercentage * 0.2 +
      leadsPercentage * 0.3 +
      concorrentesPercentage * 0.1
  );

  const enrichmentPercentage = Math.min(100, overallProgress);

  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
      <h4 className="text-lg font-bold text-gray-900 mb-2">{pesquisa.nome}</h4>
      <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
        {pesquisa.descricao || 'Sem descrição'}
      </p>

      <div className="mb-4 space-y-2">
        {/* Progresso Geral */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 font-medium">Progresso Geral</span>
            <span className="font-bold text-blue-600">{enrichmentPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all"
              style={{ width: `${enrichmentPercentage}%` }}
            />
          </div>
        </div>

        {/* Detalhamento por componente */}
        <div className="text-xs space-y-1 text-gray-600">
          <div className="flex justify-between">
            <span>• Clientes:</span>
            <span className="font-medium">
              {pesquisa.clientesEnriquecidos}/{totalClientes} ({clientesPercentage}%)
            </span>
          </div>
          <div className="flex justify-between">
            <span>• Mercados:</span>
            <span className="font-medium">
              {pesquisa.mercadosCount}/{metaMercados} ({mercadosPercentage}%)
            </span>
          </div>
          <div className="flex justify-between">
            <span>• Leads:</span>
            <span className="font-medium">
              {pesquisa.leadsCount}/{metaLeads} ({leadsPercentage}%)
            </span>
          </div>
          <div className="flex justify-between">
            <span>• Concorrentes:</span>
            <span className="font-medium">
              {pesquisa.concorrentesCount}/{metaConcorrentes} ({concorrentesPercentage}%)
            </span>
          </div>
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
