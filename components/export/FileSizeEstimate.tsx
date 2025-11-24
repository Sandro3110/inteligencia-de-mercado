/**
 * FileSizeEstimate Component
 * File size estimation component
 * Part 6 of the intelligent export module
 * Server Component - does not require 'use client'
 */

import { useMemo } from 'react';
import { AlertTriangle, FileText, Info, type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

// ============================================================================
// TYPES
// ============================================================================

type Format = 'csv' | 'excel' | 'pdf' | 'json';
type OutputType = 'simple' | 'complete' | 'report';
type WarningLevel = 'none' | 'info' | 'warning' | 'danger';

interface FileSizeEstimateProps {
  recordCount: number;
  format: Format;
  outputType: OutputType;
}

interface WarningInfo {
  level: WarningLevel;
  message: string;
}

interface SizeCalculation {
  bytes: number;
  formatted: string;
  time: string;
  mb: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Average sizes per record (in bytes)
const AVERAGE_SIZES: Record<Format, Record<OutputType, number>> = {
  csv: { simple: 200, complete: 500, report: 800 },
  excel: { simple: 300, complete: 700, report: 1200 },
  pdf: { simple: 1500, complete: 3000, report: 5000 },
  json: { simple: 250, complete: 600, report: 900 },
} as const;

const FORMAT_OVERHEAD: Record<Format, number> = {
  csv: 1024,
  excel: 10240,
  pdf: 51200,
  json: 2048,
} as const;

const SIZE_THRESHOLDS = {
  DANGER_MB: 100,
  WARNING_MB: 50,
  INFO_MB: 20,
} as const;

const TIME_CONSTANTS = {
  MIN_SECONDS: 5,
  MB_TO_SECONDS_MULTIPLIER: 2,
  SECONDS_PER_MINUTE: 60,
} as const;

const BYTE_UNITS = {
  BYTES_PER_KB: 1024,
  SIZE_NAMES: ['Bytes', 'KB', 'MB', 'GB'],
  DECIMAL_PLACES: 100,
} as const;

const ICON_SIZES = {
  SMALL: 'w-4 h-4',
} as const;

const LABELS = {
  SIZE_LABEL: 'Tamanho estimado:',
  DETAILS_SUMMARY: 'Detalhes do cálculo',
  RECORDS_LABEL: 'registros',
  OVERHEAD_LABEL: 'Overhead do formato:',
  TOTAL_LABEL: 'Total:',
  BYTES_UNIT: 'bytes',
  TIME_SECONDS: (seconds: number) => `~${seconds} segundos`,
  TIME_MINUTES: (minutes: number) => `~${minutes} minuto${minutes > 1 ? 's' : ''}`,
} as const;

const WARNING_MESSAGES = {
  DANGER: 'Arquivo muito grande (>100MB). Considere adicionar filtros ou dividir em lotes.',
  WARNING: 'Arquivo grande (>50MB). Geração pode demorar alguns minutos.',
  INFO: 'Arquivo médio (>20MB). Geração pode demorar até 1 minuto.',
} as const;

const CLASSES = {
  CONTAINER: 'space-y-3',
  SIZE_ROW: 'flex items-center gap-2',
  SIZE_LABEL: 'text-sm text-slate-600',
  SIZE_BADGE: 'font-mono',
  TIME_TEXT: 'text-xs text-slate-500',
  ICON_COLOR: 'text-slate-500',
  DETAILS: 'text-xs text-slate-500',
  DETAILS_SUMMARY: 'cursor-pointer hover:text-slate-700',
  DETAILS_CONTENT: 'mt-2 space-y-1 pl-4',
  ALERT_TEXT: 'text-sm',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = BYTE_UNITS.BYTES_PER_KB;
  const sizes = BYTE_UNITS.SIZE_NAMES;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  const rounded = Math.round(value * BYTE_UNITS.DECIMAL_PLACES) / BYTE_UNITS.DECIMAL_PLACES;

  return `${rounded} ${sizes[i]}`;
}

/**
 * Estimate processing time based on file size
 */
function estimateTime(bytes: number): string {
  const mb = bytes / (BYTE_UNITS.BYTES_PER_KB * BYTE_UNITS.BYTES_PER_KB);
  const seconds = Math.max(
    TIME_CONSTANTS.MIN_SECONDS,
    Math.ceil(mb * TIME_CONSTANTS.MB_TO_SECONDS_MULTIPLIER)
  );

  if (seconds < TIME_CONSTANTS.SECONDS_PER_MINUTE) {
    return LABELS.TIME_SECONDS(seconds);
  }

  const minutes = Math.ceil(seconds / TIME_CONSTANTS.SECONDS_PER_MINUTE);
  return LABELS.TIME_MINUTES(minutes);
}

/**
 * Get warning information based on file size
 */
function getWarningInfo(mb: number): WarningInfo {
  if (mb > SIZE_THRESHOLDS.DANGER_MB) {
    return {
      level: 'danger',
      message: WARNING_MESSAGES.DANGER,
    };
  }

  if (mb > SIZE_THRESHOLDS.WARNING_MB) {
    return {
      level: 'warning',
      message: WARNING_MESSAGES.WARNING,
    };
  }

  if (mb > SIZE_THRESHOLDS.INFO_MB) {
    return {
      level: 'info',
      message: WARNING_MESSAGES.INFO,
    };
  }

  return { level: 'none', message: '' };
}

/**
 * Calculate file size estimation
 */
function calculateSize(
  recordCount: number,
  format: Format,
  outputType: OutputType
): SizeCalculation {
  const avgSize = AVERAGE_SIZES[format][outputType];
  const overhead = FORMAT_OVERHEAD[format];
  const bytes = recordCount * avgSize + overhead;
  const formatted = formatBytes(bytes);
  const time = estimateTime(bytes);
  const mb = bytes / (BYTE_UNITS.BYTES_PER_KB * BYTE_UNITS.BYTES_PER_KB);

  return { bytes, formatted, time, mb };
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Size badge display
 */
interface SizeBadgeProps {
  formatted: string;
  time: string;
}

function SizeBadge({ formatted, time }: SizeBadgeProps) {
  return (
    <div className={CLASSES.SIZE_ROW}>
      <FileText className={`${ICON_SIZES.SMALL} ${CLASSES.ICON_COLOR}`} />
      <span className={CLASSES.SIZE_LABEL}>{LABELS.SIZE_LABEL}</span>
      <Badge variant="secondary" className={CLASSES.SIZE_BADGE}>
        {formatted}
      </Badge>
      <span className={CLASSES.TIME_TEXT}>({time})</span>
    </div>
  );
}

/**
 * Warning alert display
 */
interface WarningAlertProps {
  warningInfo: WarningInfo;
}

function WarningAlert({ warningInfo }: WarningAlertProps) {
  if (warningInfo.level === 'none') {
    return null;
  }

  const isDanger = warningInfo.level === 'danger';
  const Icon = isDanger ? AlertTriangle : Info;

  return (
    <Alert variant={isDanger ? 'destructive' : 'default'}>
      <Icon className={ICON_SIZES.SMALL} />
      <AlertDescription className={CLASSES.ALERT_TEXT}>{warningInfo.message}</AlertDescription>
    </Alert>
  );
}

/**
 * Calculation details display
 */
interface CalculationDetailsProps {
  recordCount: number;
  avgSize: number;
  overhead: number;
  formatted: string;
}

function CalculationDetails({
  recordCount,
  avgSize,
  overhead,
  formatted,
}: CalculationDetailsProps) {
  const recordsTotal = recordCount * avgSize;

  return (
    <details className={CLASSES.DETAILS}>
      <summary className={CLASSES.DETAILS_SUMMARY}>{LABELS.DETAILS_SUMMARY}</summary>
      <div className={CLASSES.DETAILS_CONTENT}>
        <div>
          • {recordCount} {LABELS.RECORDS_LABEL} × {avgSize} {LABELS.BYTES_UNIT} ={' '}
          {formatBytes(recordsTotal)}
        </div>
        <div>
          • {LABELS.OVERHEAD_LABEL} {formatBytes(overhead)}
        </div>
        <div>
          • {LABELS.TOTAL_LABEL} {formatted}
        </div>
      </div>
    </details>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Display file size estimation with warnings and details
 */
export function FileSizeEstimate({ recordCount, format, outputType }: FileSizeEstimateProps) {
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const sizeCalculation = useMemo(
    () => calculateSize(recordCount, format, outputType),
    [recordCount, format, outputType]
  );

  const warningInfo = useMemo(() => getWarningInfo(sizeCalculation.mb), [sizeCalculation.mb]);

  const avgSize = useMemo(() => AVERAGE_SIZES[format][outputType], [format, outputType]);

  const overhead = useMemo(() => FORMAT_OVERHEAD[format], [format]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={CLASSES.CONTAINER}>
      {/* Size badge */}
      <SizeBadge formatted={sizeCalculation.formatted} time={sizeCalculation.time} />

      {/* Warning if necessary */}
      <WarningAlert warningInfo={warningInfo} />

      {/* Technical details */}
      <CalculationDetails
        recordCount={recordCount}
        avgSize={avgSize}
        overhead={overhead}
        formatted={sizeCalculation.formatted}
      />
    </div>
  );
}
