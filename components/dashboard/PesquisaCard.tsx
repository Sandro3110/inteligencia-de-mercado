'use client';

import { useState } from 'react';
import {
  Zap,
  BarChart3,
  Download,
  RefreshCw,
  MapPin,
  FileText,
  Pause,
  X,
  Eye,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { GenerateReportButton } from '@/components/enrichment-v3/GenerateReportButton';
import { CleanEnrichmentModal } from '@/components/pesquisas/CleanEnrichmentModal';
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
    produtosCount?: number;
    geoEnriquecimentoTotal?: number;
    geoEnriquecimentoTotalEntidades?: number;
    clientesQualidadeMedia?: number;
    leadsQualidadeMedia?: number;
    concorrentesQualidadeMedia?: number;
  };
  onEnrich: (projectId: number, pesquisaId: number) => void;
  onGeocode: (projectId: number, pesquisaId: number) => void;
  onViewResults: (projectId: number, pesquisaId: number) => void;
  onExport: (projectId: number, pesquisaId: number) => void;
  onViewEnrichment?: (projectId: number, pesquisaId: number) => void;
  onRefresh?: () => void;
}

export function PesquisaCard({
  pesquisa,
  onEnrich,
  onGeocode,
  onViewResults,
  onExport,
  onViewEnrichment,
  onRefresh,
}: PesquisaCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCleanModalOpen, setIsCleanModalOpen] = useState(false);

  // Mutations para pausar/cancelar enriquecimento
  const pauseMutation = trpc.enrichmentBatch.pause.useMutation({
    onSuccess: () => {
      toast.success('Enriquecimento pausado');
      if (onRefresh) onRefresh();
    },
    onError: () => {
      toast.error('Erro ao pausar enriquecimento');
    },
  });

  const cancelMutation = trpc.enrichmentBatch.cancel.useMutation({
    onSuccess: () => {
      toast.success('Enriquecimento cancelado');
      if (onRefresh) onRefresh();
    },
    onError: () => {
      toast.error('Erro ao cancelar enriquecimento');
    },
  });

  const cleanMutation = trpc.pesquisas.cleanEnrichment.useMutation({
    onSuccess: (data) => {
      toast.success(
        `Limpeza concluída! Removidos: ${data.stats.leadsRemoved} leads, ${data.stats.concorrentesRemoved} concorrentes, ${data.stats.produtosRemoved} produtos`
      );
      setIsCleanModalOpen(false);
      if (onRefresh) onRefresh();
    },
    onError: (error) => {
      toast.error(`Erro ao limpar: ${error.message}`);
    },
  });

  // Buscar status do enrichment job
  const { data: enrichmentJob } = trpc.pesquisas.getEnrichmentJobStatus.useQuery(
    { pesquisaId: pesquisa.id },
    { refetchInterval: 30000 }
  );

  // Buscar status do geocoding job
  const { data: geocodingJob } = trpc.geocoding.getLatestJob.useQuery(
    { pesquisaId: pesquisa.id },
    { refetchInterval: 30000 }
  );

  // Calcular progresso
  const totalClientes = pesquisa.totalClientes;
  const enrichmentPercentage =
    totalClientes > 0 ? Math.round((pesquisa.clientesEnriquecidos / totalClientes) * 100) : 0;

  const isCompleted = enrichmentJob
    ? enrichmentJob.currentBatch >= enrichmentJob.totalBatches &&
      enrichmentJob.status === 'completed'
    : enrichmentPercentage >= 95;

  const isGeocoding = geocodingJob?.status === 'processing';
  const geocodingCompleted = geocodingJob?.status === 'completed';

  // Verificar se está enriquecendo
  const isEnriching = enrichmentJob?.status === 'processing' && enrichmentPercentage < 95;

  const geoTotal = pesquisa.geoEnriquecimentoTotal || 0;
  const geoTotalEntidades = pesquisa.geoEnriquecimentoTotalEntidades || 0;
  const geoPercentage =
    geoTotalEntidades > 0 ? Math.round((geoTotal / geoTotalEntidades) * 100) : 0;

  // Calcular qualidade média
  const qualidadeClientes = pesquisa.clientesQualidadeMedia || 0;
  const qualidadeLeads = pesquisa.leadsQualidadeMedia || 0;
  const qualidadeConcorrentes = pesquisa.concorrentesQualidadeMedia || 0;

  let qualidadeGeral = 0;
  let totalPeso = 0;

  if (qualidadeClientes > 0) {
    qualidadeGeral += qualidadeClientes * 0.5;
    totalPeso += 0.5;
  }
  if (qualidadeLeads > 0) {
    qualidadeGeral += qualidadeLeads * 0.3;
    totalPeso += 0.3;
  }
  if (qualidadeConcorrentes > 0) {
    qualidadeGeral += qualidadeConcorrentes * 0.2;
    totalPeso += 0.2;
  }

  const qualidadePercentage = totalPeso > 0 ? Math.round(qualidadeGeral / totalPeso) : 0;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Erro ao atualizar métricas:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="text-xl font-bold text-gray-900 mb-1">{pesquisa.nome}</h4>
            <p className="text-sm text-gray-500 line-clamp-1">
              {pesquisa.descricao || 'Sem descrição'}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="ml-3 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
            title="Atualizar métricas"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          {enrichmentPercentage > 0 && onViewEnrichment ? (
            /* Badge clicável quando em andamento */
            <button
              onClick={() => onViewEnrichment(pesquisa.projectId, pesquisa.id)}
              className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full transition-all ${
                isCompleted
                  ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                  : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 cursor-pointer'
              }`}
              title="Clique para ver detalhes do enriquecimento"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full mr-2 ${
                  isCompleted ? 'bg-green-500' : 'bg-blue-500 animate-pulse'
                }`}
              />
              {isCompleted ? 'Finalizada' : 'Em andamento'}
              <Eye className="w-3 h-3 ml-1.5" />
            </button>
          ) : (
            /* Badge não clicável quando não iniciada */
            <span
              className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                isCompleted
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : enrichmentPercentage > 0
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-gray-50 text-gray-600 border border-gray-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full mr-2 ${
                  isCompleted
                    ? 'bg-green-500'
                    : enrichmentPercentage > 0
                      ? 'bg-blue-500 animate-pulse'
                      : 'bg-gray-400'
                }`}
              />
              {isCompleted
                ? 'Finalizada'
                : enrichmentPercentage > 0
                  ? 'Em andamento'
                  : 'Não iniciada'}
            </span>
          )}

          {(geoPercentage > 0 || geocodingJob) && (
            <span
              className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                geoPercentage >= 95 || geocodingCompleted
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : isGeocoding
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-blue-50 text-blue-600 border border-blue-200'
              }`}
            >
              <MapPin className={`w-3 h-3 mr-1.5 ${isGeocoding ? 'animate-pulse' : ''}`} />
              {geoPercentage >= 95 || geocodingCompleted
                ? 'Geocodificado'
                : isGeocoding
                  ? `Geocodificando (${geoPercentage}%)`
                  : `Parcial (${geoPercentage}%)`}
            </span>
          )}
        </div>
      </div>

      {/* Métricas em Grid */}
      <div className="p-6 grid grid-cols-2 gap-4">
        {/* Card: Clientes */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-4 border border-blue-200">
          <div className="text-sm font-medium text-blue-700 mb-1">Clientes</div>
          <div className="text-2xl font-bold text-blue-900">{pesquisa.totalClientes}</div>
          <div className="text-xs text-blue-600 mt-1">
            {pesquisa.clientesEnriquecidos} enriquecidos ({enrichmentPercentage}%)
          </div>
        </div>

        {/* Card: Leads */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg p-4 border border-purple-200">
          <div className="text-sm font-medium text-purple-700 mb-1">Leads</div>
          <div className="text-2xl font-bold text-purple-900">{pesquisa.leadsCount}</div>
          <div className="text-xs text-purple-600 mt-1">Oportunidades identificadas</div>
        </div>

        {/* Card: Mercados */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-lg p-4 border border-emerald-200">
          <div className="text-sm font-medium text-emerald-700 mb-1">Mercados</div>
          <div className="text-2xl font-bold text-emerald-900">{pesquisa.mercadosCount}</div>
          <div className="text-xs text-emerald-600 mt-1">Segmentos mapeados</div>
        </div>

        {/* Card: Produtos */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-lg p-4 border border-amber-200">
          <div className="text-sm font-medium text-amber-700 mb-1">Produtos</div>
          <div className="text-2xl font-bold text-amber-900">{pesquisa.produtosCount || 0}</div>
          <div className="text-xs text-amber-600 mt-1">Soluções catalogadas</div>
        </div>
      </div>

      {/* Barras de Progresso */}
      <div className="px-6 pb-6 space-y-3">
        {/* Progresso Geral */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-sm font-medium text-gray-700">Progresso Geral</span>
            <span className="text-sm font-bold text-blue-600">{enrichmentPercentage}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${enrichmentPercentage}%` }}
            />
          </div>
        </div>

        {/* Qualidade Média */}
        {qualidadePercentage > 0 && (
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-medium text-gray-700">Qualidade Média</span>
              <span
                className={`text-sm font-bold ${
                  qualidadePercentage >= 71
                    ? 'text-green-600'
                    : qualidadePercentage >= 41
                      ? 'text-yellow-600'
                      : 'text-red-600'
                }`}
              >
                {qualidadePercentage}%{' '}
                {qualidadePercentage >= 71 ? '⭐⭐⭐' : qualidadePercentage >= 41 ? '⭐⭐' : '⭐'}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  qualidadePercentage >= 71
                    ? 'bg-gradient-to-r from-green-500 to-green-600'
                    : qualidadePercentage >= 41
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                      : 'bg-gradient-to-r from-red-500 to-red-600'
                }`}
                style={{ width: `${qualidadePercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Geocodificação */}
        {geoPercentage > 0 && (
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-medium text-gray-700">Geocodificação</span>
              <span className="text-sm font-bold text-emerald-600">
                {geoTotal}/{geoTotalEntidades} ({geoPercentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${geoPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Botões de Ação */}
      <div className="p-6 pt-0 space-y-2">
        {/* Botões Principais */}
        {isEnriching ? (
          /* Enriquecimento em andamento: mostrar Pausar e Cancelar */
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => pauseMutation.mutate()}
              disabled={pauseMutation.isPending}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all font-medium shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Pause className="w-4 h-4" />
              {pauseMutation.isPending ? 'Pausando...' : 'Pausar'}
            </button>
            <button
              onClick={() => {
                if (confirm('Tem certeza que deseja cancelar o enriquecimento?')) {
                  cancelMutation.mutate();
                }
              }}
              disabled={cancelMutation.isPending}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4" />
              {cancelMutation.isPending ? 'Cancelando...' : 'Cancelar'}
            </button>
            <button
              onClick={() => onGeocode(pesquisa.projectId, pesquisa.id)}
              disabled={isGeocoding}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all font-medium shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MapPin className={`w-4 h-4 ${isGeocoding ? 'animate-pulse' : ''}`} />
            </button>
          </div>
        ) : (
          /* Enriquecimento não iniciado: mostrar Enriquecer e Geocodificar */
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onEnrich(pesquisa.projectId, pesquisa.id)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-medium shadow-sm hover:shadow"
            >
              <Zap className="w-4 h-4" />
              Enriquecer
            </button>
            <button
              onClick={() => onGeocode(pesquisa.projectId, pesquisa.id)}
              disabled={isGeocoding}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all font-medium shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MapPin className={`w-4 h-4 ${isGeocoding ? 'animate-pulse' : ''}`} />
              {isGeocoding ? 'Processando...' : 'Geocodificar'}
            </button>
          </div>
        )}

        {/* Botões Secundários */}
        <div className="grid grid-cols-5 gap-2">
          <GenerateReportButton pesquisaId={pesquisa.id} size="sm" />
          {onViewEnrichment && (
            <button
              onClick={() => onViewEnrichment(pesquisa.projectId, pesquisa.id)}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              title="Ver Enriquecimento"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
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
            title="Exportar Excel"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsCleanModalOpen(true)}
            disabled={pesquisa.clientesEnriquecidos === 0}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            title={pesquisa.clientesEnriquecidos === 0 ? 'Nenhum dado para limpar' : 'Limpar Tudo'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal de Confirmação */}
      <CleanEnrichmentModal
        isOpen={isCleanModalOpen}
        onClose={() => setIsCleanModalOpen(false)}
        onConfirm={() => cleanMutation.mutate({ pesquisaId: pesquisa.id })}
        isLoading={cleanMutation.isPending}
        stats={{
          totalClientes: pesquisa.totalClientes,
          clientesEnriquecidos: pesquisa.clientesEnriquecidos,
          leadsCount: pesquisa.leadsCount || 0,
          concorrentesCount: pesquisa.concorrentesCount || 0,
          produtosCount: pesquisa.produtosCount || 0,
          mercadosCount: pesquisa.mercadosCount || 0,
        }}
      />
    </div>
  );
}
