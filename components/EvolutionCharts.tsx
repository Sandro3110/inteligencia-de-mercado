'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from './ui/card';
import { Button } from './ui/button';

// ============================================================================
// CONSTANTS
// ============================================================================

const PERIODS = {
  HOUR_24: '24h',
  DAYS_7: '7d',
  DAYS_30: '30d',
  ALL: 'all',
} as const;

const PERIOD_LABELS: Record<Period, string> = {
  [PERIODS.HOUR_24]: '24 Horas',
  [PERIODS.DAYS_7]: '7 Dias',
  [PERIODS.DAYS_30]: '30 Dias',
  [PERIODS.ALL]: 'Tudo',
};

const CHART_TITLES = {
  CLIENTS_OVER_TIME: '📈 Clientes Processados ao Longo do Tempo',
  SUCCESS_RATE: '📊 Taxa de Sucesso por Lote',
  AVG_TIME: '⏱️ Tempo Médio por Cliente (segundos)',
} as const;

const CHART_COLORS = {
  GRID: 'oklch(0.3 0 0)',
  AXIS: 'oklch(0.6 0 0)',
  CLIENTS: 'oklch(0.7 0.15 200)',
  SUCCESS: 'oklch(0.7 0.15 150)',
  ERROR: 'oklch(0.6 0.15 30)',
  TIME: 'oklch(0.7 0.15 280)',
  TOOLTIP_BG: 'oklch(0.2 0 0)',
  TOOLTIP_BORDER: 'oklch(0.3 0 0)',
  TOOLTIP_LABEL: 'oklch(0.9 0 0)',
} as const;

const CHART_CONFIG = {
  HEIGHT: 300,
  FONT_SIZE: '12px',
  STROKE_WIDTH: 2,
  DOT_RADIUS: 4,
  ACTIVE_DOT_RADIUS: 6,
  BAR_RADIUS: [8, 8, 0, 0] as [number, number, number, number],
  STROKE_DASH: '3 3',
  BORDER_RADIUS: '8px',
  GRADIENT_OFFSET_START: '5%',
  GRADIENT_OFFSET_END: '95%',
  GRADIENT_OPACITY_START: 0.8,
  GRADIENT_OPACITY_END: 0.1,
} as const;

const CHART_LABELS = {
  CLIENTS: 'Clientes',
  SUCCESS: 'Sucesso (%)',
  ERROR: 'Erro (%)',
  TIME: 'Tempo (s)',
} as const;

// Mock data - TODO: Replace with real backend data
const MOCK_DATA = {
  CLIENTS_OVER_TIME: [
    { time: '00:00', clientes: 0 },
    { time: '01:00', clientes: 12 },
    { time: '02:00', clientes: 28 },
    { time: '03:00', clientes: 45 },
    { time: '04:00', clientes: 67 },
    { time: '05:00', clientes: 89 },
    { time: '06:00', clientes: 112 },
    { time: '07:00', clientes: 138 },
    { time: '08:00', clientes: 152 },
  ],
  SUCCESS_RATE_BY_BATCH: [
    { lote: 'Lote 1', sucesso: 98, erro: 2 },
    { lote: 'Lote 2', sucesso: 96, erro: 4 },
    { lote: 'Lote 3', sucesso: 100, erro: 0 },
    { lote: 'Lote 4', sucesso: 94, erro: 6 },
    { lote: 'Lote 5', sucesso: 98, erro: 2 },
  ],
  AVG_TIME_PER_CLIENT: [
    { hora: '00:00', tempo: 28 },
    { hora: '01:00', tempo: 30 },
    { hora: '02:00', tempo: 27 },
    { hora: '03:00', tempo: 32 },
    { hora: '04:00', tempo: 29 },
    { hora: '05:00', tempo: 31 },
    { hora: '06:00', tempo: 28 },
    { hora: '07:00', tempo: 30 },
    { hora: '08:00', tempo: 29 },
  ],
};

// ============================================================================
// TYPES
// ============================================================================

interface EvolutionChartsProps {
  runId: number;
}

type Period = '24h' | '7d' | '30d' | 'all';

interface ClientsOverTimeData {
  time: string;
  clientes: number;
}

interface SuccessRateData {
  lote: string;
  sucesso: number;
  erro: number;
}

interface AvgTimeData {
  hora: string;
  tempo: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getTooltipStyle() {
  return {
    backgroundColor: CHART_COLORS.TOOLTIP_BG,
    border: `1px solid ${CHART_COLORS.TOOLTIP_BORDER}`,
    borderRadius: CHART_CONFIG.BORDER_RADIUS,
  };
}

function getLabelStyle() {
  return { color: CHART_COLORS.TOOLTIP_LABEL };
}

function getAxisStyle() {
  return { fontSize: CHART_CONFIG.FONT_SIZE };
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function EvolutionCharts({ runId }: EvolutionChartsProps) {
  // State
  const [period, setPeriod] = useState<Period>(PERIODS.HOUR_24);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handlePeriodChange = useCallback((newPeriod: Period) => {
    setPeriod(newPeriod);
  }, []);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // TODO: Fetch real data from backend based on runId and period
  const clientsOverTime = useMemo(
    () => MOCK_DATA.CLIENTS_OVER_TIME,
    []
  );

  const successRateByBatch = useMemo(
    () => MOCK_DATA.SUCCESS_RATE_BY_BATCH,
    []
  );

  const avgTimePerClient = useMemo(
    () => MOCK_DATA.AVG_TIME_PER_CLIENT,
    []
  );

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderPeriodButton = useCallback(
    (periodValue: Period) => (
      <Button
        key={periodValue}
        variant={period === periodValue ? 'default' : 'outline'}
        size="sm"
        onClick={() => handlePeriodChange(periodValue)}
      >
        {PERIOD_LABELS[periodValue]}
      </Button>
    ),
    [period, handlePeriodChange]
  );

  const renderPeriodSelector = useCallback(
    () => (
      <div className="flex gap-2">
        {Object.values(PERIODS).map(renderPeriodButton)}
      </div>
    ),
    [renderPeriodButton]
  );

  const renderClientsOverTimeChart = useCallback(
    () => (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          {CHART_TITLES.CLIENTS_OVER_TIME}
        </h3>
        <ResponsiveContainer width="100%" height={CHART_CONFIG.HEIGHT}>
          <LineChart data={clientsOverTime}>
            <CartesianGrid
              strokeDasharray={CHART_CONFIG.STROKE_DASH}
              stroke={CHART_COLORS.GRID}
            />
            <XAxis
              dataKey="time"
              stroke={CHART_COLORS.AXIS}
              style={getAxisStyle()}
            />
            <YAxis stroke={CHART_COLORS.AXIS} style={getAxisStyle()} />
            <Tooltip
              contentStyle={getTooltipStyle()}
              labelStyle={getLabelStyle()}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="clientes"
              stroke={CHART_COLORS.CLIENTS}
              strokeWidth={CHART_CONFIG.STROKE_WIDTH}
              dot={{ fill: CHART_COLORS.CLIENTS, r: CHART_CONFIG.DOT_RADIUS }}
              activeDot={{ r: CHART_CONFIG.ACTIVE_DOT_RADIUS }}
              name={CHART_LABELS.CLIENTS}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    ),
    [clientsOverTime]
  );

  const renderSuccessRateChart = useCallback(
    () => (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          {CHART_TITLES.SUCCESS_RATE}
        </h3>
        <ResponsiveContainer width="100%" height={CHART_CONFIG.HEIGHT}>
          <BarChart data={successRateByBatch}>
            <CartesianGrid
              strokeDasharray={CHART_CONFIG.STROKE_DASH}
              stroke={CHART_COLORS.GRID}
            />
            <XAxis
              dataKey="lote"
              stroke={CHART_COLORS.AXIS}
              style={getAxisStyle()}
            />
            <YAxis stroke={CHART_COLORS.AXIS} style={getAxisStyle()} />
            <Tooltip
              contentStyle={getTooltipStyle()}
              labelStyle={getLabelStyle()}
            />
            <Legend />
            <Bar
              dataKey="sucesso"
              fill={CHART_COLORS.SUCCESS}
              name={CHART_LABELS.SUCCESS}
              radius={CHART_CONFIG.BAR_RADIUS}
            />
            <Bar
              dataKey="erro"
              fill={CHART_COLORS.ERROR}
              name={CHART_LABELS.ERROR}
              radius={CHART_CONFIG.BAR_RADIUS}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    ),
    [successRateByBatch]
  );

  const renderAvgTimeChart = useCallback(
    () => (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{CHART_TITLES.AVG_TIME}</h3>
        <ResponsiveContainer width="100%" height={CHART_CONFIG.HEIGHT}>
          <AreaChart data={avgTimePerClient}>
            <defs>
              <linearGradient id="colorTempo" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset={CHART_CONFIG.GRADIENT_OFFSET_START}
                  stopColor={CHART_COLORS.TIME}
                  stopOpacity={CHART_CONFIG.GRADIENT_OPACITY_START}
                />
                <stop
                  offset={CHART_CONFIG.GRADIENT_OFFSET_END}
                  stopColor={CHART_COLORS.TIME}
                  stopOpacity={CHART_CONFIG.GRADIENT_OPACITY_END}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray={CHART_CONFIG.STROKE_DASH}
              stroke={CHART_COLORS.GRID}
            />
            <XAxis
              dataKey="hora"
              stroke={CHART_COLORS.AXIS}
              style={getAxisStyle()}
            />
            <YAxis stroke={CHART_COLORS.AXIS} style={getAxisStyle()} />
            <Tooltip
              contentStyle={getTooltipStyle()}
              labelStyle={getLabelStyle()}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="tempo"
              stroke={CHART_COLORS.TIME}
              strokeWidth={CHART_CONFIG.STROKE_WIDTH}
              fill="url(#colorTempo)"
              name={CHART_LABELS.TIME}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    ),
    [avgTimePerClient]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {renderPeriodSelector()}
      {renderClientsOverTimeChart()}
      {renderSuccessRateChart()}
      {renderAvgTimeChart()}
    </div>
  );
}
