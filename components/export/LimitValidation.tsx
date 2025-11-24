/**
 * LimitValidation Component
 * Modal for export limit validation
 * Part 8 of the intelligent export module
 */

'use client';

import { useMemo, useCallback } from 'react';
import { AlertTriangle, Filter, Layers, Split, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

// ============================================================================
// TYPES
// ============================================================================

interface LimitValidationProps {
  open: boolean;
  onClose: () => void;
  estimatedSize: number; // in MB
  recordCount: number;
  onReduceFields: () => void;
  onAddFilters: () => void;
  onSplitBatches: () => void;
  onProceedAnyway: () => void;
}

interface OptimizationOption {
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  title: string;
  description: string;
  onClick: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SIZE_THRESHOLDS = {
  VERY_LARGE: 100, // MB
  LARGE: 50, // MB
} as const;

const ICON_SIZES = {
  SMALL: 'w-5 h-5',
  MEDIUM: 'w-6 h-6',
} as const;

const LABELS = {
  TITLE_VERY_LARGE: 'Arquivo Muito Grande Detectado',
  TITLE_LARGE: 'Arquivo Grande Detectado',
  DESCRIPTION: 'A exportação pode demorar vários minutos e consumir recursos significativos',
  ESTIMATED_SIZE: 'Tamanho Estimado',
  TOTAL_RECORDS: 'Total de Registros',
  OVER_LIMIT_BADGE: 'Acima do limite recomendado (100 MB)',
  OPTIMIZATION_TITLE: 'Opções para Reduzir o Tamanho:',
  CANCEL: 'Cancelar',
  PROCEED_VERY_LARGE: 'Prosseguir Mesmo Assim',
  PROCEED_NORMAL: 'Continuar',
  WARNING_TITLE: '⚠️ Atenção:',
  WARNING_TEXT:
    'Exportações acima de 100 MB podem falhar ou demorar mais de 5 minutos. Recomendamos fortemente usar uma das opções de otimização acima.',
} as const;

const OPTIMIZATION_OPTIONS_CONFIG = [
  {
    icon: Layers,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-100',
    title: 'Reduzir Campos Selecionados',
    description:
      'Voltar ao passo 3 e selecionar apenas os campos essenciais. Pode reduzir o tamanho em até 60%.',
    action: 'reduceFields',
  },
  {
    icon: Filter,
    iconColor: 'text-green-600',
    bgColor: 'bg-green-100',
    title: 'Adicionar Filtros',
    description:
      'Voltar ao passo 2 e adicionar filtros para reduzir o número de registros. Recomendado para exportações focadas.',
    action: 'addFilters',
  },
  {
    icon: Split,
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-100',
    title: 'Dividir em Lotes',
    description:
      'Gerar múltiplos arquivos menores automaticamente. Ideal para exportações muito grandes.',
    action: 'splitBatches',
  },
] as const;

const CLASSES = {
  ICON_CONTAINER: 'p-2 bg-yellow-100 rounded-lg',
  STATS_CARD: 'bg-slate-50 border border-slate-200 rounded-lg p-4',
  STATS_GRID: 'grid grid-cols-2 gap-4',
  STAT_LABEL: 'text-xs text-slate-600 mb-1',
  STAT_VALUE: 'text-2xl font-bold text-slate-900',
  BADGE_CONTAINER: 'mt-3 pt-3 border-t border-slate-200',
  OPTIONS_CONTAINER: 'space-y-3',
  OPTIONS_TITLE: 'text-sm font-semibold text-slate-900',
  OPTION_BUTTON:
    'w-full p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left',
  OPTION_CONTENT: 'flex items-start gap-3',
  OPTION_ICON_CONTAINER: 'p-2 rounded-lg',
  OPTION_TEXT_CONTAINER: 'flex-1',
  OPTION_TITLE: 'font-semibold text-slate-900 mb-1',
  OPTION_DESCRIPTION: 'text-xs text-slate-600',
  WARNING_BOX: 'bg-red-50 border border-red-200 rounded-lg p-3',
  WARNING_TEXT: 'text-xs text-red-800',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format size in MB with one decimal place
 */
function formatSize(sizeInMB: number): string {
  return `${sizeInMB.toFixed(1)} MB`;
}

/**
 * Format record count with Brazilian locale
 */
function formatRecordCount(count: number): string {
  return count.toLocaleString('pt-BR');
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Statistics display card
 */
interface StatsCardProps {
  estimatedSize: number;
  recordCount: number;
  isVeryLarge: boolean;
}

function StatsCard({ estimatedSize, recordCount, isVeryLarge }: StatsCardProps) {
  return (
    <div className={CLASSES.STATS_CARD}>
      <div className={CLASSES.STATS_GRID}>
        <div>
          <p className={CLASSES.STAT_LABEL}>{LABELS.ESTIMATED_SIZE}</p>
          <p className={CLASSES.STAT_VALUE}>{formatSize(estimatedSize)}</p>
        </div>
        <div>
          <p className={CLASSES.STAT_LABEL}>{LABELS.TOTAL_RECORDS}</p>
          <p className={CLASSES.STAT_VALUE}>{formatRecordCount(recordCount)}</p>
        </div>
      </div>

      {isVeryLarge && (
        <div className={CLASSES.BADGE_CONTAINER}>
          <Badge variant="destructive" className="text-xs">
            {LABELS.OVER_LIMIT_BADGE}
          </Badge>
        </div>
      )}
    </div>
  );
}

/**
 * Single optimization option button
 */
interface OptimizationButtonProps {
  option: OptimizationOption;
}

function OptimizationButton({ option }: OptimizationButtonProps) {
  const Icon = option.icon;

  return (
    <button onClick={option.onClick} className={CLASSES.OPTION_BUTTON}>
      <div className={CLASSES.OPTION_CONTENT}>
        <div className={`${CLASSES.OPTION_ICON_CONTAINER} ${option.bgColor}`}>
          <Icon className={`${ICON_SIZES.SMALL} ${option.iconColor}`} />
        </div>
        <div className={CLASSES.OPTION_TEXT_CONTAINER}>
          <h5 className={CLASSES.OPTION_TITLE}>{option.title}</h5>
          <p className={CLASSES.OPTION_DESCRIPTION}>{option.description}</p>
        </div>
      </div>
    </button>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Modal for validating export limits and suggesting optimizations
 */
export function LimitValidation({
  open,
  onClose,
  estimatedSize,
  recordCount,
  onReduceFields,
  onAddFilters,
  onSplitBatches,
  onProceedAnyway,
}: LimitValidationProps) {
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const isVeryLarge = useMemo(
    () => estimatedSize > SIZE_THRESHOLDS.VERY_LARGE,
    [estimatedSize]
  );

  const isLarge = useMemo(() => estimatedSize > SIZE_THRESHOLDS.LARGE, [estimatedSize]);

  const dialogTitle = useMemo(
    () => (isVeryLarge ? LABELS.TITLE_VERY_LARGE : LABELS.TITLE_LARGE),
    [isVeryLarge]
  );

  const proceedButtonLabel = useMemo(
    () => (isVeryLarge ? LABELS.PROCEED_VERY_LARGE : LABELS.PROCEED_NORMAL),
    [isVeryLarge]
  );

  const proceedButtonVariant = useMemo(
    () => (isVeryLarge ? 'destructive' : 'default') as 'destructive' | 'default',
    [isVeryLarge]
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleReduceFields = useCallback(() => {
    onReduceFields();
    onClose();
  }, [onReduceFields, onClose]);

  const handleAddFilters = useCallback(() => {
    onAddFilters();
    onClose();
  }, [onAddFilters, onClose]);

  const handleSplitBatches = useCallback(() => {
    onSplitBatches();
    onClose();
  }, [onSplitBatches, onClose]);

  const handleProceed = useCallback(() => {
    onProceedAnyway();
    onClose();
  }, [onProceedAnyway, onClose]);

  /**
   * Build optimization options with handlers
   */
  const optimizationOptions = useMemo<OptimizationOption[]>(() => {
    const handlers = {
      reduceFields: handleReduceFields,
      addFilters: handleAddFilters,
      splitBatches: handleSplitBatches,
    };

    return OPTIMIZATION_OPTIONS_CONFIG.map((config) => ({
      icon: config.icon,
      iconColor: config.iconColor,
      bgColor: config.bgColor,
      title: config.title,
      description: config.description,
      onClick: handlers[config.action as keyof typeof handlers],
    }));
  }, [handleReduceFields, handleAddFilters, handleSplitBatches]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        {/* Header */}
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={CLASSES.ICON_CONTAINER}>
              <AlertTriangle className={`${ICON_SIZES.MEDIUM} text-yellow-600`} />
            </div>
            <div>
              <DialogTitle>{dialogTitle}</DialogTitle>
              <DialogDescription>{LABELS.DESCRIPTION}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Statistics */}
        <StatsCard
          estimatedSize={estimatedSize}
          recordCount={recordCount}
          isVeryLarge={isVeryLarge}
        />

        {/* Optimization Options */}
        <div className={CLASSES.OPTIONS_CONTAINER}>
          <h4 className={CLASSES.OPTIONS_TITLE}>{LABELS.OPTIMIZATION_TITLE}</h4>

          {optimizationOptions.map((option, index) => (
            <OptimizationButton key={index} option={option} />
          ))}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="flex items-center justify-between">
          <Button variant="outline" onClick={onClose}>
            {LABELS.CANCEL}
          </Button>
          <Button variant={proceedButtonVariant} onClick={handleProceed}>
            {proceedButtonLabel}
          </Button>
        </DialogFooter>

        {/* Final Warning */}
        {isVeryLarge && (
          <div className={CLASSES.WARNING_BOX}>
            <p className={CLASSES.WARNING_TEXT}>
              <strong>{LABELS.WARNING_TITLE}</strong> {LABELS.WARNING_TEXT}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
