'use client';

/**
 * ReportGenerator - Gerador de Relatórios Executivos
 * Gera relatórios PDF com análise estratégica completa
 */

import { useState, useCallback, useMemo } from 'react';
import { trpc } from '@/lib/trpc/client';
import { useSelectedProject } from '@/hooks/useSelectedProject';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  FileText,
  Download,
  Loader2,
  CheckCircle2,
  TrendingUp,
  Target,
  Users,
  Filter,
} from 'lucide-react';
import { generateExecutivePDF } from '@/lib/generatePDF';

// ============================================================================
// CONSTANTS
// ============================================================================

const LABELS = {
  TITLE: 'Relatórios Executivos',
  SUBTITLE: 'Gere relatórios PDF com análise estratégica completa',
  CARD_TITLE: 'Relatório Executivo Completo',
  CARD_DESCRIPTION:
    'Análise estratégica com insights, top mercados, leads prioritários e análise competitiva',
  SHOW_FILTERS: 'Mostrar Filtros',
  HIDE_FILTERS: 'Ocultar Filtros',
  FILTERS_TITLE: 'Filtros do Relatório',
  PESQUISA: 'Pesquisa',
  ALL_PESQUISAS: 'Todas as Pesquisas',
  DATE_FROM: 'Data Início',
  DATE_TO: 'Data Fim',
  ACTIVE_FILTERS: 'Filtros ativos:',
  CLEAR_FILTERS: 'Limpar Filtros',
  GENERATE_BUTTON: 'Gerar Relatório PDF',
  GENERATING: 'Gerando Relatório...',
  SELECT_PROJECT: 'Selecione um projeto para gerar o relatório',
  PREVIEW_TITLE: 'Preview dos Dados',
} as const;

const SECTION_TITLES = {
  EXECUTIVE_SUMMARY: 'Sumário Executivo',
  TOP_MARKETS: 'Top 10 Mercados',
  PRIORITY_LEADS: 'Leads Prioritários',
  STRATEGIC_INSIGHTS: 'Insights Estratégicos Incluídos',
} as const;

const SECTION_DESCRIPTIONS = {
  EXECUTIVE_SUMMARY: 'Estatísticas gerais do projeto com métricas-chave',
  TOP_MARKETS: 'Mercados com maior volume de leads e análise competitiva',
  PRIORITY_LEADS: 'Top 20 leads com score ≥ 80 e informações de contato',
} as const;

const INSIGHTS = [
  'Percentual de leads de alta qualidade e potencial de conversão',
  'Recomendações de priorização por mercado',
  'Análise de densidade competitiva e estratégias de diferenciação',
  'Identificação de oportunidades de entrada facilitada',
  'Sugestões de expansão de prospecção',
] as const;

const STATS_LABELS = {
  MARKETS: 'Mercados',
  CLIENTS: 'Clientes',
  COMPETITORS: 'Concorrentes',
  LEADS: 'Leads',
  HIGH_QUALITY: 'Alta Qualidade',
} as const;

const TOAST_MESSAGES = {
  NO_PROJECT: 'Nenhum projeto selecionado',
  GENERATING: (hasFilters: boolean) =>
    `Gerando relatório executivo${hasFilters ? ' (com filtros)' : ''}...`,
  SUCCESS: 'Relatório PDF gerado com sucesso!',
  ERROR_DATA: 'Erro ao gerar dados do relatório',
  ERROR: 'Erro ao gerar relatório',
} as const;

const DATE_LOCALE = 'pt-BR';

// ============================================================================
// TYPES
// ============================================================================

interface Pesquisa {
  id: number;
  nome: string;
}

interface ReportSummary {
  totalMercados: number;
  totalClientes: number;
  totalConcorrentes: number;
  totalLeads: number;
  leadsHighQuality: number;
}

interface ReportData {
  summary: ReportSummary;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(DATE_LOCALE);
}

function hasActiveFilters(dateFrom: string, dateTo: string): boolean {
  return !!(dateFrom || dateTo);
}

function getActiveFiltersText(dateFrom: string, dateTo: string): string {
  const parts: string[] = [];

  if (dateFrom) {
    parts.push(`De ${formatDate(dateFrom)}`);
  }

  if (dateTo) {
    parts.push(`Até ${formatDate(dateTo)}`);
  }

  return parts.join(' ');
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ReportGenerator() {
  const { selectedProjectId } = useSelectedProject();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedPesquisaId, setSelectedPesquisaId] = useState<number | null>(
    null
  );

  // Buscar pesquisas do projeto selecionado
  const { data: pesquisas } = trpc.pesquisas.list.useQuery(undefined, {
    enabled: !!selectedProjectId,
  });

  const {
    data: reportData,
    refetch,
    isLoading,
  } = trpc.executiveReports.generate.useQuery(
    {
      projectId: selectedProjectId!,
      pesquisaId: selectedPesquisaId ?? undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    },
    { enabled: false } // Não buscar automaticamente
  );

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const hasFilters = useMemo(
    () => hasActiveFilters(dateFrom, dateTo),
    [dateFrom, dateTo]
  );

  const activeFiltersText = useMemo(
    () => getActiveFiltersText(dateFrom, dateTo),
    [dateFrom, dateTo]
  );

  const canGenerate = useMemo(
    () => !isGenerating && !isLoading && !!selectedProjectId,
    [isGenerating, isLoading, selectedProjectId]
  );

  const filterButtonText = useMemo(
    () => (showFilters ? LABELS.HIDE_FILTERS : LABELS.SHOW_FILTERS),
    [showFilters]
  );

  const hasReportData = useMemo(() => !!reportData, [reportData]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleGenerate = useCallback(async () => {
    if (!selectedProjectId) {
      toast.error(TOAST_MESSAGES.NO_PROJECT);
      return;
    }

    setIsGenerating(true);
    toast.info(TOAST_MESSAGES.GENERATING(hasFilters));

    try {
      const result = await refetch();

      if (result.data) {
        generateExecutivePDF(result.data);
        toast.success(TOAST_MESSAGES.SUCCESS);
      } else {
        toast.error(TOAST_MESSAGES.ERROR_DATA);
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error(TOAST_MESSAGES.ERROR);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedProjectId, hasFilters, refetch]);

  const toggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  const handlePesquisaChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      setSelectedPesquisaId(value ? Number(value) : null);
    },
    []
  );

  const handleDateFromChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDateFrom(e.target.value);
    },
    []
  );

  const handleDateToChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDateTo(e.target.value);
    },
    []
  );

  const handleClearFilters = useCallback(() => {
    setDateFrom('');
    setDateTo('');
  }, []);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderHeader = useCallback(
    () => (
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-500" />
            {LABELS.TITLE}
          </h2>
          <p className="text-slate-600 mt-1">{LABELS.SUBTITLE}</p>
        </div>
      </div>
    ),
    []
  );

  const renderPesquisaSelect = useCallback(
    () => (
      <div className="space-y-2">
        <Label htmlFor="pesquisa">{LABELS.PESQUISA}</Label>
        <select
          id="pesquisa"
          value={selectedPesquisaId || ''}
          onChange={handlePesquisaChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-700 bg-white"
        >
          <option value="">{LABELS.ALL_PESQUISAS}</option>
          {pesquisas?.map((p: Pesquisa) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
      </div>
    ),
    [selectedPesquisaId, pesquisas, handlePesquisaChange]
  );

  const renderDateFilters = useCallback(
    () => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dateFrom">{LABELS.DATE_FROM}</Label>
          <Input
            id="dateFrom"
            type="date"
            value={dateFrom}
            onChange={handleDateFromChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateTo">{LABELS.DATE_TO}</Label>
          <Input
            id="dateTo"
            type="date"
            value={dateTo}
            onChange={handleDateToChange}
          />
        </div>
      </div>
    ),
    [dateFrom, dateTo, handleDateFromChange, handleDateToChange]
  );

  const renderActiveFilters = useCallback(
    () => (
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <CheckCircle2 className="w-4 h-4 text-green-500" />
        <span>
          {LABELS.ACTIVE_FILTERS} {activeFiltersText}
        </span>
      </div>
    ),
    [activeFiltersText]
  );

  const renderFiltersSection = useCallback(
    () => (
      <div className="space-y-4">
        <Button variant="outline" onClick={toggleFilters} className="gap-2">
          <Filter className="w-4 h-4" />
          {filterButtonText}
        </Button>

        {showFilters && (
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-4">
            <h3 className="font-medium text-slate-900 mb-3">
              {LABELS.FILTERS_TITLE}
            </h3>

            {renderPesquisaSelect()}
            {renderDateFilters()}

            {hasFilters && renderActiveFilters()}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-slate-600 hover:text-slate-900"
            >
              {LABELS.CLEAR_FILTERS}
            </Button>
          </div>
        )}
      </div>
    ),
    [
      showFilters,
      filterButtonText,
      hasFilters,
      toggleFilters,
      renderPesquisaSelect,
      renderDateFilters,
      renderActiveFilters,
      handleClearFilters,
    ]
  );

  const renderReportSection = useCallback(
    (
      icon: React.ReactNode,
      title: string,
      description: string,
      colorClass: string
    ) => (
      <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-3 mb-2">
          {icon}
          <h3 className="font-medium text-slate-900">{title}</h3>
        </div>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
    ),
    []
  );

  const renderReportSections = useCallback(
    () => (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderReportSection(
          <TrendingUp className="w-5 h-5 text-green-500" />,
          SECTION_TITLES.EXECUTIVE_SUMMARY,
          SECTION_DESCRIPTIONS.EXECUTIVE_SUMMARY,
          'text-green-500'
        )}
        {renderReportSection(
          <Target className="w-5 h-5 text-blue-500" />,
          SECTION_TITLES.TOP_MARKETS,
          SECTION_DESCRIPTIONS.TOP_MARKETS,
          'text-blue-500'
        )}
        {renderReportSection(
          <Users className="w-5 h-5 text-purple-500" />,
          SECTION_TITLES.PRIORITY_LEADS,
          SECTION_DESCRIPTIONS.PRIORITY_LEADS,
          'text-purple-500'
        )}
      </div>
    ),
    [renderReportSection]
  );

  const renderInsights = useCallback(
    () => (
      <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-5 h-5 text-blue-600" />
          <h3 className="font-medium text-slate-900">
            {SECTION_TITLES.STRATEGIC_INSIGHTS}
          </h3>
        </div>
        <ul className="space-y-2 text-sm text-slate-700">
          {INSIGHTS.map((insight, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
    []
  );

  const renderGenerateButton = useCallback(
    () => (
      <div className="flex justify-center pt-4">
        <Button
          onClick={handleGenerate}
          disabled={!canGenerate}
          size="lg"
          className="gap-2 px-8"
        >
          {isGenerating || isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {LABELS.GENERATING}
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              {LABELS.GENERATE_BUTTON}
            </>
          )}
        </Button>
      </div>
    ),
    [handleGenerate, canGenerate, isGenerating, isLoading]
  );

  const renderStatItem = useCallback(
    (label: string, value: number, colorClass = 'text-slate-900') => (
      <div>
        <p className="text-slate-600">{label}</p>
        <p className={`text-xl font-bold ${colorClass}`}>{value}</p>
      </div>
    ),
    []
  );

  const renderPreview = useCallback(
    () => (
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900 text-sm">
            {LABELS.PREVIEW_TITLE}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            {renderStatItem(
              STATS_LABELS.MARKETS,
              reportData!.summary.totalMercados
            )}
            {renderStatItem(
              STATS_LABELS.CLIENTS,
              reportData!.summary.totalClientes
            )}
            {renderStatItem(
              STATS_LABELS.COMPETITORS,
              reportData!.summary.totalConcorrentes
            )}
            {renderStatItem(
              STATS_LABELS.LEADS,
              reportData!.summary.totalLeads
            )}
            {renderStatItem(
              STATS_LABELS.HIGH_QUALITY,
              reportData!.summary.leadsHighQuality,
              'text-green-400'
            )}
          </div>
        </CardContent>
      </Card>
    ),
    [reportData, renderStatItem]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      {renderHeader()}

      {/* Card Principal */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            {LABELS.CARD_TITLE}
          </CardTitle>
          <CardDescription>{LABELS.CARD_DESCRIPTION}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filtros */}
          {renderFiltersSection()}

          {/* Conteúdo do Relatório */}
          {renderReportSections()}

          {/* Insights Incluídos */}
          {renderInsights()}

          {/* Botão de Geração */}
          {renderGenerateButton()}

          {!selectedProjectId && (
            <p className="text-center text-sm text-slate-600">
              {LABELS.SELECT_PROJECT}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Preview de Dados (se disponível) */}
      {hasReportData && renderPreview()}
    </div>
  );
}
