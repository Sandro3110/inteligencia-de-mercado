'use client';

import { useState } from 'react';
import { Zap, BarChart3, Download, RefreshCw } from 'lucide-react';
import { GenerateReportButton } from '@/components/enrichment-v3/GenerateReportButton';
import { trpc } from '@/lib/trpc/client';

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
    clientesQualidadeMedia?: number;
    leadsQualidadeMedia?: number;
    concorrentesQualidadeMedia?: number;
  };
  onEnrich: (projectId: number, pesquisaId: number) => void;
  onViewResults: (projectId: number, pesquisaId: number) => void;
  onExport: (projectId: number, pesquisaId: number) => void;
  onRefresh?: () => void;
}

export function PesquisaCard({
  pesquisa,
  onEnrich,
  onViewResults,
  onExport,
  onRefresh,
}: PesquisaCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Apenas recarregar dados - a query já recalcula tudo
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Erro ao atualizar métricas:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  // ===== CÁLCULO DE PROGRESSO =====
  // Progresso baseado APENAS em clientes enriquecidos (base real)
  // Mercados, leads e concorrentes são RESULTADOS do enriquecimento, não metas

  const totalClientes = pesquisa.totalClientes;

  // Metas estimadas (apenas para exibição de frações, não para cálculo de progresso)
  const metaMercados = totalClientes * 2;
  const metaLeads = totalClientes * 13;
  const metaConcorrentes = totalClientes * 18;

  // PROGRESSO GERAL = Apenas clientes enriquecidos / total de clientes
  const enrichmentPercentage =
    totalClientes > 0 ? Math.round((pesquisa.clientesEnriquecidos / totalClientes) * 100) : 0;

  // Percentuais individuais (para exibição no detalhamento)
  const clientesPercentage = enrichmentPercentage;
  const mercadosPercentage =
    metaMercados > 0 ? Math.min(100, Math.round((pesquisa.mercadosCount / metaMercados) * 100)) : 0;
  const leadsPercentage =
    metaLeads > 0 ? Math.min(100, Math.round((pesquisa.leadsCount / metaLeads) * 100)) : 0;
  const concorrentesPercentage =
    metaConcorrentes > 0
      ? Math.min(100, Math.round((pesquisa.concorrentesCount / metaConcorrentes) * 100))
      : 0;

  // ===== CÁLCULO DE QUALIDADE MÉDIA GERAL =====
  const qualidadeClientes = pesquisa.clientesQualidadeMedia || 0;
  const qualidadeLeads = pesquisa.leadsQualidadeMedia || 0;
  const qualidadeConcorrentes = pesquisa.concorrentesQualidadeMedia || 0;

  // Média ponderada de qualidade (apenas entidades que têm score)
  let qualidadeGeral = 0;
  let totalPeso = 0;

  if (qualidadeClientes > 0) {
    qualidadeGeral += qualidadeClientes * 0.5; // 50% peso
    totalPeso += 0.5;
  }
  if (qualidadeLeads > 0) {
    qualidadeGeral += qualidadeLeads * 0.3; // 30% peso
    totalPeso += 0.3;
  }
  if (qualidadeConcorrentes > 0) {
    qualidadeGeral += qualidadeConcorrentes * 0.2; // 20% peso
    totalPeso += 0.2;
  }

  const qualidadePercentage = totalPeso > 0 ? Math.round(qualidadeGeral / totalPeso) : 0;

  // Classificação de qualidade (reservado para uso futuro)
  const _qualidadeClassificacao =
    qualidadePercentage >= 71 ? 'Alta' : qualidadePercentage >= 41 ? 'Média' : 'Baixa';
  const qualidadeCor =
    qualidadePercentage >= 71
      ? 'text-green-600'
      : qualidadePercentage >= 41
        ? 'text-yellow-600'
        : 'text-red-600';
  const qualidadeEstrelas =
    qualidadePercentage >= 71 ? '⭐⭐⭐' : qualidadePercentage >= 41 ? '⭐⭐' : '⭐';

  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
      <h4 className="text-lg font-bold text-gray-900 mb-2">{pesquisa.nome}</h4>
      <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
        {pesquisa.descricao || 'Sem descrição'}
      </p>

      <div className="mb-4 space-y-2">
        {/* Status e Botão Atualizar Métricas */}
        <div className="flex justify-between items-center mb-2">
          {/* TAG de Status */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${
                enrichmentPercentage >= 97
                  ? 'bg-green-100 text-green-800'
                  : enrichmentPercentage > 0
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full mr-1.5 ${
                  enrichmentPercentage >= 97
                    ? 'bg-green-500'
                    : enrichmentPercentage > 0
                      ? 'bg-blue-500 animate-pulse'
                      : 'bg-gray-400'
                }`}
              />
              {enrichmentPercentage >= 97
                ? 'Finalizada'
                : enrichmentPercentage > 0
                  ? 'Em andamento'
                  : 'Não iniciada'}
            </span>
          </div>

          {/* Botão Atualizar */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Recalcular métricas"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>

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

        {/* Qualidade Média */}
        {qualidadePercentage > 0 && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 font-medium">Qualidade Média</span>
              <span className={`font-bold ${qualidadeCor}`}>
                {qualidadePercentage}% {qualidadeEstrelas}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  qualidadePercentage >= 71
                    ? 'bg-green-600'
                    : qualidadePercentage >= 41
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
                style={{ width: `${qualidadePercentage}%` }}
              />
            </div>
          </div>
        )}

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
