'use client';

/**
 * CompararMercadosModal - Modal de Comparação de Mercados
 * Comparação visual e detalhada de múltiplos mercados com filtros avançados
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Download, X, Filter, Calendar, Sliders } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

// ============================================================================
// CONSTANTS
// ============================================================================

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b'] as const;

const FORM_DEFAULTS = {
  PERIOD_DAYS: 30,
  MIN_QUALITY: 0,
  STATUS_FILTER: 'todos',
  ONLY_COMPLETE: false,
} as const;

const PERIOD_OPTIONS = [
  { value: '7', label: 'Últimos 7 dias' },
  { value: '30', label: 'Últimos 30 dias' },
  { value: '90', label: 'Últimos 90 dias' },
  { value: '999999', label: 'Todos' },
] as const;

const STATUS_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'rich', label: 'Validados' },
  { value: 'discarded', label: 'Descartados' },
] as const;

const QUALITY_SLIDER = {
  MAX: 100,
  STEP: 5,
} as const;

const REQUIRED_FIELDS = ['nome', 'cnpj'] as const;

const LABELS = {
  TITLE: 'Comparação de Mercados',
  DESCRIPTION: (count: number) => `Comparando ${count} mercados selecionados`,
  FILTERS_BUTTON: 'Filtros',
  EXPORT_BUTTON: 'Exportar PDF',
  CLEAR_FILTERS: 'Limpar Filtros',
  PERIOD: 'Período',
  MIN_QUALITY: (value: number) => `Qualidade Mínima: ${value}%`,
  STATUS: 'Status',
  OPTIONS: 'Opções',
  ONLY_COMPLETE: 'Apenas completos',
  MARKET_LABEL: (index: number) => `Mercado ${index + 1}`,
  VISUAL_COMPARISON: 'Comparação Visual',
  DETAILED_METRICS: 'Métricas Detalhadas',
  METRIC: 'Métrica',
} as const;

const CARD_LABELS = {
  SEGMENTATION: 'Segmentação:',
  CLIENTS: 'Clientes:',
  COMPETITORS: 'Concorrentes:',
  LEADS: 'Leads:',
  AVG_QUALITY: 'Qualidade Média:',
} as const;

const TABLE_METRICS = {
  TOTAL_CLIENTS: 'Total de Clientes',
  TOTAL_COMPETITORS: 'Total de Concorrentes',
  TOTAL_LEADS: 'Total de Leads',
  LEADS_PER_CLIENT: 'Leads por Cliente',
  COMPETITORS_PER_CLIENT: 'Concorrentes por Cliente',
  AVG_QUALITY_CLIENTS: 'Qualidade Média Clientes',
  AVG_QUALITY_COMPETITORS: 'Qualidade Média Concorrentes',
  AVG_QUALITY_LEADS: 'Qualidade Média Leads',
  AVG_QUALITY_OVERALL: 'Qualidade Média Geral',
} as const;

const CHART_METRICS = {
  CLIENTS: 'Clientes',
  COMPETITORS: 'Concorrentes',
  LEADS: 'Leads',
  AVG_QUALITY: 'Qualidade Média',
} as const;

const TOAST_MESSAGES = {
  EXPORT_INFO: 'Exportação em PDF será implementada em breve',
} as const;

const LAYOUT = {
  MAX_WIDTH: 'max-w-6xl',
  MAX_HEIGHT: 'max-h-[90vh]',
  CHART_HEIGHT: 300,
} as const;

// ============================================================================
// TYPES
// ============================================================================

interface CompararMercadosModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  mercadoIds?: number[];
  mercados?: Mercado[];
}

interface Mercado {
  id: number;
  nome: string;
  segmentacao: string;
}

interface Entity {
  id: number;
  nome: string;
  cnpj?: string;
  createdAt?: string;
  qualidadeScore?: number;
  validationStatus?: string;
}

type Cliente = Entity;
type Concorrente = Entity;
type Lead = Entity;

interface MercadoData {
  mercado: Mercado | undefined;
  clientes: Cliente[];
  concorrentes: Concorrente[];
  leads: Lead[];
  qualidadeMediaClientes: number;
  qualidadeMediaConcorrentes: number;
  qualidadeMediaLeads: number;
  qualidadeMediaGeral: number;
}

interface ChartDataPoint {
  metrica: string;
  [key: string]: string | number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateCutoffDate(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function isEntityWithinPeriod(
  entity: Entity,
  cutoffDate: Date
): boolean {
  if (!entity.createdAt) return true;
  return new Date(entity.createdAt) >= cutoffDate;
}

function isEntityAboveQuality(
  entity: Entity,
  minQuality: number
): boolean {
  return (entity.qualidadeScore || 0) >= minQuality;
}

function isEntityMatchingStatus(
  entity: Entity,
  statusFilter: string
): boolean {
  if (statusFilter === 'todos') return true;
  return entity.validationStatus === statusFilter;
}

function isEntityComplete(entity: Entity): boolean {
  return REQUIRED_FIELDS.every((field) => entity[field]);
}

function applyFilters(
  entities: Entity[],
  cutoffDate: Date,
  minQuality: number,
  statusFilter: string,
  onlyComplete: boolean
): Entity[] {
  return entities.filter((entity) => {
    if (!isEntityWithinPeriod(entity, cutoffDate)) return false;
    if (!isEntityAboveQuality(entity, minQuality)) return false;
    if (!isEntityMatchingStatus(entity, statusFilter)) return false;
    if (onlyComplete && !isEntityComplete(entity)) return false;
    return true;
  });
}

function calculateAverageQuality(entities: Entity[]): number {
  if (entities.length === 0) return 0;

  const total = entities.reduce((sum, entity) => {
    return sum + (entity.qualidadeScore || 0);
  }, 0);

  return Math.round(total / entities.length);
}

function calculateRatio(numerator: number, denominator: number): string {
  if (denominator === 0) return '0';
  return (numerator / denominator).toFixed(1);
}

function hasActiveFilters(
  periodDays: number,
  minQuality: number,
  statusFilter: string,
  onlyComplete: boolean
): boolean {
  return (
    periodDays !== FORM_DEFAULTS.PERIOD_DAYS ||
    minQuality > FORM_DEFAULTS.MIN_QUALITY ||
    statusFilter !== FORM_DEFAULTS.STATUS_FILTER ||
    onlyComplete !== FORM_DEFAULTS.ONLY_COMPLETE
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function CompararMercadosModal({
  isOpen = false,
  onClose = () => {},
  onOpenChange,
  mercadoIds = [],
  mercados,
}: CompararMercadosModalProps) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [periodoDias, setPeriodoDias] = useState<number>(
    FORM_DEFAULTS.PERIOD_DAYS
  );
  const [qualidadeMinima, setQualidadeMinima] = useState<number>(
    FORM_DEFAULTS.MIN_QUALITY
  );
  const [statusFiltro, setStatusFiltro] = useState<string>(
    FORM_DEFAULTS.STATUS_FILTER
  );
  const [apenasCompletos, setApenasCompletos] = useState<boolean>(
    FORM_DEFAULTS.ONLY_COMPLETE
  );
  const [mostrarFiltros, setMostrarFiltros] = useState<boolean>(false);

  // ============================================================================
  // QUERIES
  // ============================================================================

  const mercadosData = useMemo<MercadoData[]>(() => {
    const cutoffDate = calculateCutoffDate(periodoDias);

    return mercadoIds.map((id) => {
      const mercado = mercados.find((m) => m.id === id);

      // Note: These hooks are called unconditionally in the same order
       
      const { data: clientesData } = trpc.clientes.byMercado.useQuery(
        { mercadoId: id },
        { enabled: isOpen && !!id }
      );
       
      const { data: concorrentesData } = trpc.concorrentes.byMercado.useQuery(
        { mercadoId: id },
        { enabled: isOpen && !!id }
      );
       
      const { data: leadsData } = trpc.leads.byMercado.useQuery(
        { mercadoId: id },
        { enabled: isOpen && !!id }
      );

      const rawClientes = (clientesData?.data || []) as Cliente[];
      const rawConcorrentes = (concorrentesData?.data || []) as Concorrente[];
      const rawLeads = (leadsData?.data || []) as Lead[];

      const clientes = applyFilters(
        rawClientes,
        cutoffDate,
        qualidadeMinima,
        statusFiltro,
        apenasCompletos
      ) as Cliente[];

      const concorrentes = applyFilters(
        rawConcorrentes,
        cutoffDate,
        qualidadeMinima,
        statusFiltro,
        apenasCompletos
      ) as Concorrente[];

      const leads = applyFilters(
        rawLeads,
        cutoffDate,
        qualidadeMinima,
        statusFiltro,
        apenasCompletos
      ) as Lead[];

      const qualidadeMediaClientes = calculateAverageQuality(clientes);
      const qualidadeMediaConcorrentes = calculateAverageQuality(concorrentes);
      const qualidadeMediaLeads = calculateAverageQuality(leads);
      const qualidadeMediaGeral = Math.round(
        (qualidadeMediaClientes +
          qualidadeMediaConcorrentes +
          qualidadeMediaLeads) /
          3
      );

      return {
        mercado,
        clientes,
        concorrentes,
        leads,
        qualidadeMediaClientes,
        qualidadeMediaConcorrentes,
        qualidadeMediaLeads,
        qualidadeMediaGeral,
      };
    });
  }, [
    mercadoIds,
    mercados,
    isOpen,
    periodoDias,
    qualidadeMinima,
    statusFiltro,
    apenasCompletos,
  ]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const chartData = useMemo<ChartDataPoint[]>(() => {
    return [
      {
        metrica: CHART_METRICS.CLIENTS,
        ...mercadosData.reduce((acc, data, idx) => {
          acc[LABELS.MARKET_LABEL(idx + 1)] = data.clientes.length;
          return acc;
        }, {} as Record<string, number>),
      },
      {
        metrica: CHART_METRICS.COMPETITORS,
        ...mercadosData.reduce((acc, data, idx) => {
          acc[LABELS.MARKET_LABEL(idx + 1)] = data.concorrentes.length;
          return acc;
        }, {} as Record<string, number>),
      },
      {
        metrica: CHART_METRICS.LEADS,
        ...mercadosData.reduce((acc, data, idx) => {
          acc[LABELS.MARKET_LABEL(idx + 1)] = data.leads.length;
          return acc;
        }, {} as Record<string, number>),
      },
      {
        metrica: CHART_METRICS.AVG_QUALITY,
        ...mercadosData.reduce((acc, data, idx) => {
          acc[LABELS.MARKET_LABEL(idx + 1)] = data.qualidadeMediaGeral;
          return acc;
        }, {} as Record<string, number>),
      },
    ];
  }, [mercadosData]);

  const showFilterBadge = useMemo(
    () =>
      hasActiveFilters(
        periodoDias,
        qualidadeMinima,
        statusFiltro,
        apenasCompletos
      ),
    [periodoDias, qualidadeMinima, statusFiltro, apenasCompletos]
  );

  const dialogDescription = useMemo(
    () => LABELS.DESCRIPTION(mercadoIds.length),
    [mercadoIds.length]
  );

  const minQualityLabel = useMemo(
    () => LABELS.MIN_QUALITY(qualidadeMinima),
    [qualidadeMinima]
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleExportPDF = useCallback(async () => {
    try {
      toast.info('Gerando PDF de comparação...');

      // Preparar dados para exportação
      const exportData = {
        mercados: mercadosData.map((data, idx) => ({
          nome: data.mercado?.nome || `Mercado ${idx + 1}`,
          segmentacao: data.mercado?.segmentacao || 'N/A',
          totalClientes: data.clientes.length,
          totalConcorrentes: data.concorrentes.length,
          totalLeads: data.leads.length,
          qualidadeMediaClientes: data.qualidadeMediaClientes,
          qualidadeMediaConcorrentes: data.qualidadeMediaConcorrentes,
          qualidadeMediaLeads: data.qualidadeMediaLeads,
          qualidadeMediaGeral: data.qualidadeMediaGeral,
        })),
        chartData,
      };

      // Chamar API de exportação PDF
      const response = await fetch('/api/export/comparacao-mercados-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportData),
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar PDF');
      }

      // Download do PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `comparacao_mercados_${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('PDF exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar PDF');
    }
  }, [mercadosData, chartData]);

  const toggleFilters = useCallback(() => {
    setMostrarFiltros((prev) => !prev);
  }, []);

  const handlePeriodChange = useCallback((value: string) => {
    setPeriodoDias(parseInt(value, 10));
  }, []);

  const handleQualityChange = useCallback((value: number[]) => {
    setQualidadeMinima(value[0]);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatusFiltro(value);
  }, []);

  const handleCompleteToggle = useCallback((checked: boolean) => {
    setApenasCompletos(checked);
  }, []);

  const handleClearFilters = useCallback(() => {
    setPeriodoDias(FORM_DEFAULTS.PERIOD_DAYS);
    setQualidadeMinima(FORM_DEFAULTS.MIN_QUALITY);
    setStatusFiltro(FORM_DEFAULTS.STATUS_FILTER);
    setApenasCompletos(FORM_DEFAULTS.ONLY_COMPLETE);
  }, []);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderPeriodOption = useCallback(
    (option: (typeof PERIOD_OPTIONS)[number]) => (
      <SelectItem key={option.value} value={option.value}>
        {option.label}
      </SelectItem>
    ),
    []
  );

  const renderStatusOption = useCallback(
    (option: (typeof STATUS_OPTIONS)[number]) => (
      <SelectItem key={option.value} value={option.value}>
        {option.label}
      </SelectItem>
    ),
    []
  );

  const renderFiltersPanel = useCallback(
    () => (
      <div className="bg-muted/50 rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtro de Período */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {LABELS.PERIOD}
            </Label>
            <Select
              value={periodoDias.toString()}
              onValueChange={handlePeriodChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>{PERIOD_OPTIONS.map(renderPeriodOption)}</SelectContent>
            </Select>
          </div>

          {/* Filtro de Qualidade Mínima */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              {minQualityLabel}
            </Label>
            <Slider
              value={[qualidadeMinima]}
              onValueChange={handleQualityChange}
              max={QUALITY_SLIDER.MAX}
              step={QUALITY_SLIDER.STEP}
              className="mt-2"
            />
          </div>

          {/* Filtro de Status */}
          <div className="space-y-2">
            <Label>{LABELS.STATUS}</Label>
            <Select value={statusFiltro} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>{STATUS_OPTIONS.map(renderStatusOption)}</SelectContent>
            </Select>
          </div>

          {/* Toggle Dados Completos */}
          <div className="space-y-2">
            <Label>{LABELS.OPTIONS}</Label>
            <div className="flex items-center space-x-2 h-10">
              <Switch
                checked={apenasCompletos}
                onCheckedChange={handleCompleteToggle}
              />
              <Label
                className="text-sm cursor-pointer"
                onClick={() => handleCompleteToggle(!apenasCompletos)}
              >
                {LABELS.ONLY_COMPLETE}
              </Label>
            </div>
          </div>
        </div>

        {/* Botão Limpar Filtros */}
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            <X className="w-4 h-4 mr-2" />
            {LABELS.CLEAR_FILTERS}
          </Button>
        </div>
      </div>
    ),
    [
      periodoDias,
      qualidadeMinima,
      statusFiltro,
      apenasCompletos,
      minQualityLabel,
      handlePeriodChange,
      handleQualityChange,
      handleStatusChange,
      handleCompleteToggle,
      handleClearFilters,
      renderPeriodOption,
      renderStatusOption,
    ]
  );

  const renderMercadoCard = useCallback(
    (data: MercadoData, idx: number) => (
      <div
        key={data.mercado?.id}
        className="p-4 rounded-lg border-2"
        style={{ borderColor: CHART_COLORS[idx] }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-base line-clamp-1">
            {data.mercado?.nome}
          </h3>
          <Badge
            variant="outline"
            style={{
              borderColor: CHART_COLORS[idx],
              color: CHART_COLORS[idx],
            }}
          >
            {LABELS.MARKET_LABEL(idx + 1)}
          </Badge>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {CARD_LABELS.SEGMENTATION}
            </span>
            <span className="font-medium">{data.mercado?.segmentacao}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{CARD_LABELS.CLIENTS}</span>
            <span className="font-medium">{data.clientes.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {CARD_LABELS.COMPETITORS}
            </span>
            <span className="font-medium">{data.concorrentes.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{CARD_LABELS.LEADS}</span>
            <span className="font-medium">{data.leads.length}</span>
          </div>
          <div className="flex justify-between pt-2 border-t">
            <span className="text-muted-foreground">
              {CARD_LABELS.AVG_QUALITY}
            </span>
            <span
              className="font-semibold"
              style={{ color: CHART_COLORS[idx] }}
            >
              {data.qualidadeMediaGeral}%
            </span>
          </div>
        </div>
      </div>
    ),
    []
  );

  const renderChart = useCallback(
    () => (
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">
          {LABELS.VISUAL_COMPARISON}
        </h3>
        <ResponsiveContainer width="100%" height={LAYOUT.CHART_HEIGHT}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="metrica" />
            <YAxis />
            <Tooltip />
            <Legend />
            {mercadosData.map((_, idx) => (
              <Bar
                key={idx}
                dataKey={LABELS.MARKET_LABEL(idx + 1)}
                fill={CHART_COLORS[idx]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    ),
    [chartData, mercadosData]
  );

  const renderTableRow = useCallback(
    (
      label: string,
      getValue: (data: MercadoData) => string | number,
      isHighlighted = false
    ) => (
      <tr
        className={`border-b ${isHighlighted ? 'bg-muted/30' : ''} ${
          isHighlighted && label === TABLE_METRICS.AVG_QUALITY_OVERALL
            ? 'bg-muted/50'
            : ''
        }`}
      >
        <td
          className={`py-2 px-3 ${
            isHighlighted
              ? label === TABLE_METRICS.AVG_QUALITY_OVERALL
                ? 'font-bold'
                : 'font-medium'
              : 'text-muted-foreground'
          }`}
        >
          {label}
        </td>
        {mercadosData.map((data, idx) => (
          <td
            key={idx}
            className={`text-center py-2 px-3 ${
              isHighlighted
                ? label === TABLE_METRICS.AVG_QUALITY_OVERALL
                  ? 'font-bold text-lg'
                  : 'font-semibold'
                : 'font-medium'
            }`}
            style={isHighlighted ? { color: CHART_COLORS[idx] } : undefined}
          >
            {getValue(data)}
          </td>
        ))}
      </tr>
    ),
    [mercadosData]
  );

  const renderTable = useCallback(
    () => (
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">
          {LABELS.DETAILED_METRICS}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3">{LABELS.METRIC}</th>
                {mercadosData.map((_, idx) => (
                  <th
                    key={idx}
                    className="text-center py-2 px-3"
                    style={{ color: CHART_COLORS[idx] }}
                  >
                    {LABELS.MARKET_LABEL(idx + 1)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {renderTableRow(
                TABLE_METRICS.TOTAL_CLIENTS,
                (data) => data.clientes.length
              )}
              {renderTableRow(
                TABLE_METRICS.TOTAL_COMPETITORS,
                (data) => data.concorrentes.length
              )}
              {renderTableRow(
                TABLE_METRICS.TOTAL_LEADS,
                (data) => data.leads.length
              )}
              {renderTableRow(TABLE_METRICS.LEADS_PER_CLIENT, (data) =>
                calculateRatio(data.leads.length, data.clientes.length)
              )}
              {renderTableRow(TABLE_METRICS.COMPETITORS_PER_CLIENT, (data) =>
                calculateRatio(data.concorrentes.length, data.clientes.length)
              )}
              {renderTableRow(
                TABLE_METRICS.AVG_QUALITY_CLIENTS,
                (data) => `${data.qualidadeMediaClientes}%`,
                true
              )}
              {renderTableRow(
                TABLE_METRICS.AVG_QUALITY_COMPETITORS,
                (data) => `${data.qualidadeMediaConcorrentes}%`,
                true
              )}
              {renderTableRow(
                TABLE_METRICS.AVG_QUALITY_LEADS,
                (data) => `${data.qualidadeMediaLeads}%`,
                true
              )}
              {renderTableRow(
                TABLE_METRICS.AVG_QUALITY_OVERALL,
                (data) => `${data.qualidadeMediaGeral}%`,
                true
              )}
            </tbody>
          </table>
        </div>
      </div>
    ),
    [mercadosData, renderTableRow]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`${LAYOUT.MAX_WIDTH} ${LAYOUT.MAX_HEIGHT} overflow-y-auto`}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{LABELS.TITLE}</DialogTitle>
              <DialogDescription>{dialogDescription}</DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={toggleFilters}>
                <Filter className="w-4 h-4 mr-2" />
                {LABELS.FILTERS_BUTTON}
                {showFilterBadge && (
                  <Badge
                    variant="destructive"
                    className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    !
                  </Badge>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <Download className="w-4 h-4 mr-2" />
                {LABELS.EXPORT_BUTTON}
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Painel de Filtros */}
        {mostrarFiltros && renderFiltersPanel()}

        <div className="space-y-6 mt-4">
          {/* Cards de Mercados */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mercadosData.map(renderMercadoCard)}
          </div>

          {/* Gráfico Comparativo */}
          {renderChart()}

          {/* Tabela Comparativa Detalhada */}
          {renderTable()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
