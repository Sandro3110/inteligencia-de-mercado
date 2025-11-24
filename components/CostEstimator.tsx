import { useMemo, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, DollarSign, Zap } from 'lucide-react';

// ============================================================================
// CONSTANTS
// ============================================================================

const COST_CONFIG = {
  OPENAI_PER_CALL: 0.03, // $0.03 por chamada
  SERPAPI_PER_CALL: 0.002, // $0.002 por chamada
} as const;

const OLD_SYSTEM_CONFIG = {
  OPENAI_MULTIPLIER: (
    produtosPorMercado: number,
    concorrentesPorMercado: number,
    leadsPorMercado: number
  ) => 10 + produtosPorMercado + concorrentesPorMercado + leadsPorMercado,
  SERPAPI_CALLS_PER_CLIENT: 45,
  SECONDS_PER_CLIENT: 180, // 3 minutos
} as const;

const NEW_SYSTEM_CONFIG = {
  OPENAI_CALLS_PER_CLIENT: 1,
  SERPAPI_CALLS_PER_CLIENT: 0,
  SECONDS_PER_CLIENT: 30,
} as const;

const LABELS = {
  TITLE: 'Estimativa de Economia',
  DESCRIPTION: 'Comparação entre sistema legado e otimizado',
  OLD_SYSTEM: 'Sistema Antigo',
  NEW_SYSTEM: 'Sistema Novo',
  TOTAL_SAVINGS: 'Economia Total:',
  PROCESSING_TIME: 'Tempo de Processamento',
  OLD: 'Antigo',
  NEW: 'Novo',
  OPENAI_CALLS: (count: number) => `${count} chamadas OpenAI`,
  SERPAPI_CALLS: (count: number) => `${count} chamadas SerpAPI`,
} as const;

const DETAILS = {
  OPTIMIZED_CALLS: (oldCallsPerClient: number) =>
    `• Sistema otimizado usa 1 chamada OpenAI por cliente (vs ${oldCallsPerClient} no antigo)`,
  DEDUPLICATION: '• Deduplicação automática de mercados reduz chamadas redundantes',
  PARALLEL_PROCESSING: (percent: string) =>
    `• Processamento em paralelo acelera execução em ${percent}%`,
} as const;

const ICON_SIZES = {
  MEDIUM: 'w-5 h-5',
  LARGE: 'w-8 h-8',
} as const;

const COLORS = {
  CARD_BORDER: 'border-green-500/20',
  CARD_BG: 'bg-green-50/5',
  ICON: 'text-green-500',
  OLD_COST: 'text-destructive',
  NEW_COST: 'text-green-600',
  SAVINGS_BADGE: 'bg-green-500/10 text-green-700 border-green-500/20',
  TIME_BADGE: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
} as const;

// ============================================================================
// TYPES
// ============================================================================

interface CostEstimatorProps {
  totalClientes: number;
  produtosPorMercado?: number;
  concorrentesPorMercado?: number;
  leadsPorMercado?: number;
}

interface SystemCosts {
  openAICalls: number;
  serpAPICalls: number;
  totalCost: number;
  timeSeconds: number;
}

interface Savings {
  costSavings: number;
  costSavingsPercent: string;
  timeSavings: number;
  timeSavingsPercent: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateOldSystemCosts(
  totalClientes: number,
  produtosPorMercado: number,
  concorrentesPorMercado: number,
  leadsPorMercado: number
): SystemCosts {
  const openAICalls =
    totalClientes *
    OLD_SYSTEM_CONFIG.OPENAI_MULTIPLIER(
      produtosPorMercado,
      concorrentesPorMercado,
      leadsPorMercado
    );
  const serpAPICalls = totalClientes * OLD_SYSTEM_CONFIG.SERPAPI_CALLS_PER_CLIENT;
  const totalCost =
    openAICalls * COST_CONFIG.OPENAI_PER_CALL +
    serpAPICalls * COST_CONFIG.SERPAPI_PER_CALL;
  const timeSeconds = totalClientes * OLD_SYSTEM_CONFIG.SECONDS_PER_CLIENT;

  return { openAICalls, serpAPICalls, totalCost, timeSeconds };
}

function calculateNewSystemCosts(totalClientes: number): SystemCosts {
  const openAICalls = totalClientes * NEW_SYSTEM_CONFIG.OPENAI_CALLS_PER_CLIENT;
  const serpAPICalls = totalClientes * NEW_SYSTEM_CONFIG.SERPAPI_CALLS_PER_CLIENT;
  const totalCost =
    openAICalls * COST_CONFIG.OPENAI_PER_CALL +
    serpAPICalls * COST_CONFIG.SERPAPI_PER_CALL;
  const timeSeconds = totalClientes * NEW_SYSTEM_CONFIG.SECONDS_PER_CLIENT;

  return { openAICalls, serpAPICalls, totalCost, timeSeconds };
}

function calculateSavings(oldCosts: SystemCosts, newCosts: SystemCosts): Savings {
  const costSavings = oldCosts.totalCost - newCosts.totalCost;
  const costSavingsPercent = ((costSavings / oldCosts.totalCost) * 100).toFixed(0);
  const timeSavings = oldCosts.timeSeconds - newCosts.timeSeconds;
  const timeSavingsPercent = ((timeSavings / oldCosts.timeSeconds) * 100).toFixed(0);

  return { costSavings, costSavingsPercent, timeSavings, timeSavingsPercent };
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}min`;
  return `${minutes}min`;
}

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CostEstimator({
  totalClientes,
  produtosPorMercado = 3,
  concorrentesPorMercado = 5,
  leadsPorMercado = 5,
}: CostEstimatorProps) {
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const oldCosts = useMemo(
    () =>
      calculateOldSystemCosts(
        totalClientes,
        produtosPorMercado,
        concorrentesPorMercado,
        leadsPorMercado
      ),
    [totalClientes, produtosPorMercado, concorrentesPorMercado, leadsPorMercado]
  );

  const newCosts = useMemo(
    () => calculateNewSystemCosts(totalClientes),
    [totalClientes]
  );

  const savings = useMemo(
    () => calculateSavings(oldCosts, newCosts),
    [oldCosts, newCosts]
  );

  const oldCallsPerClient = useMemo(
    () => oldCosts.openAICalls / totalClientes,
    [oldCosts.openAICalls, totalClientes]
  );

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderHeader = useCallback(
    () => (
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className={`${ICON_SIZES.MEDIUM} ${COLORS.ICON}`} />
          {LABELS.TITLE}
        </CardTitle>
        <CardDescription>{LABELS.DESCRIPTION}</CardDescription>
      </CardHeader>
    ),
    []
  );

  const renderCostComparison = useCallback(
    () => (
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-1">
            {LABELS.OLD_SYSTEM}
          </div>
          <div className={`text-2xl font-bold ${COLORS.OLD_COST}`}>
            {formatCurrency(oldCosts.totalCost)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {LABELS.OPENAI_CALLS(oldCosts.openAICalls)}
            <br />
            {LABELS.SERPAPI_CALLS(oldCosts.serpAPICalls)}
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="text-center">
            <TrendingDown className={`${ICON_SIZES.LARGE} ${COLORS.ICON} mx-auto mb-2`} />
            <Badge variant="outline" className={COLORS.SAVINGS_BADGE}>
              -{savings.costSavingsPercent}%
            </Badge>
          </div>
        </div>

        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-1">
            {LABELS.NEW_SYSTEM}
          </div>
          <div className={`text-2xl font-bold ${COLORS.NEW_COST}`}>
            {formatCurrency(newCosts.totalCost)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {LABELS.OPENAI_CALLS(newCosts.openAICalls)}
            <br />
            {LABELS.SERPAPI_CALLS(newCosts.serpAPICalls)}
          </div>
        </div>
      </div>
    ),
    [oldCosts, newCosts, savings.costSavingsPercent]
  );

  const renderTotalSavings = useCallback(
    () => (
      <div className="pt-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className={`${ICON_SIZES.MEDIUM} ${COLORS.ICON}`} />
            <span className="font-medium">{LABELS.TOTAL_SAVINGS}</span>
          </div>
          <div className={`text-2xl font-bold ${COLORS.NEW_COST}`}>
            {formatCurrency(savings.costSavings)}
          </div>
        </div>
      </div>
    ),
    [savings.costSavings]
  );

  const renderTimeComparison = useCallback(
    () => (
      <div className="pt-4 border-t">
        <div className="text-sm font-medium mb-3">{LABELS.PROCESSING_TIME}</div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">{LABELS.OLD}</div>
            <div className={`text-lg font-bold ${COLORS.OLD_COST}`}>
              {formatTime(oldCosts.timeSeconds)}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <Badge variant="outline" className={COLORS.TIME_BADGE}>
              -{savings.timeSavingsPercent}%
            </Badge>
          </div>

          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">{LABELS.NEW}</div>
            <div className={`text-lg font-bold ${COLORS.NEW_COST}`}>
              {formatTime(newCosts.timeSeconds)}
            </div>
          </div>
        </div>
      </div>
    ),
    [oldCosts.timeSeconds, newCosts.timeSeconds, savings.timeSavingsPercent]
  );

  const renderDetails = useCallback(
    () => (
      <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
        <p>{DETAILS.OPTIMIZED_CALLS(oldCallsPerClient)}</p>
        <p>{DETAILS.DEDUPLICATION}</p>
        <p>{DETAILS.PARALLEL_PROCESSING(savings.timeSavingsPercent)}</p>
      </div>
    ),
    [oldCallsPerClient, savings.timeSavingsPercent]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Card className={`${COLORS.CARD_BORDER} ${COLORS.CARD_BG}`}>
      {renderHeader()}
      <CardContent className="space-y-6">
        {renderCostComparison()}
        {renderTotalSavings()}
        {renderTimeComparison()}
        {renderDetails()}
      </CardContent>
    </Card>
  );
}
