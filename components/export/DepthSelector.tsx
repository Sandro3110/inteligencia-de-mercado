/**
 * DepthSelector Component
 * Visual selector for analysis depth
 * Part 7 of the intelligent export module
 */

'use client';

import { useCallback, useMemo } from 'react';
import { Zap, Clock, Target, type LucideIcon } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

// ============================================================================
// TYPES
// ============================================================================

type DepthValue = 'quick' | 'balanced' | 'deep';

interface DepthSelectorProps {
  value: DepthValue;
  onChange: (depth: DepthValue) => void;
}

interface DepthOption {
  id: DepthValue;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  time: string;
  quality: string;
  features: string[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEPTH_OPTIONS: DepthOption[] = [
  {
    id: 'quick',
    title: 'Rápida',
    description: 'Análise básica e exportação imediata',
    icon: Zap,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    time: '< 30 segundos',
    quality: 'Básica',
    features: ['Dados principais', 'Sem análise contextual', 'Formato simples'],
  },
  {
    id: 'balanced',
    title: 'Balanceada',
    description: 'Equilíbrio entre velocidade e qualidade',
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    time: '1-2 minutos',
    quality: 'Boa',
    features: ['Dados completos', 'Análise contextual básica', 'Insights principais'],
  },
  {
    id: 'deep',
    title: 'Profunda',
    description: 'Análise completa com insights avançados',
    icon: Target,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    time: '3-5 minutos',
    quality: 'Excelente',
    features: [
      'Dados completos + relacionamentos',
      'Análise contextual avançada',
      'Insights estratégicos',
      'Recomendações',
    ],
  },
] as const;

const LABELS = {
  TITLE: 'Profundidade da Análise',
  SUBTITLE: 'Escolha o nível de detalhamento e análise contextual',
  SELECTED_BADGE: '✓ Selecionado',
  TIME_LABEL: 'Tempo',
  QUALITY_LABEL: 'Qualidade',
  RECOMMENDATION_ICON: '💡',
  RECOMMENDATION_TITLE: 'Recomendação:',
  RECOMMENDATION_TEXT:
    'Use Balanceada para a maioria dos casos. Escolha Profunda apenas quando precisar de insights estratégicos detalhados.',
} as const;

const ICON_SIZES = {
  MEDIUM: 'w-6 h-6',
  SMALL: 'w-1.5 h-1.5',
} as const;

const CLASSES = {
  CONTAINER: 'space-y-4',
  HEADER_TITLE: 'text-sm font-semibold text-slate-900 mb-1',
  HEADER_SUBTITLE: 'text-xs text-slate-600',
  GRID: 'grid grid-cols-1 md:grid-cols-3 gap-4',
  CARD_BASE: 'p-5 cursor-pointer transition-all',
  CARD_SELECTED: 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200',
  CARD_UNSELECTED: 'border-slate-200 hover:border-slate-300 hover:shadow-md',
  ICON_CONTAINER_BASE: 'p-3 rounded-xl',
  ICON_CONTAINER_SELECTED: 'bg-white shadow-sm',
  HEADER_ROW: 'flex items-start justify-between mb-4',
  TITLE: 'font-bold text-slate-900 mb-2 text-lg',
  DESCRIPTION: 'text-xs text-slate-600 mb-4',
  METRICS_GRID: 'grid grid-cols-2 gap-2 mb-4',
  METRIC_BOX: 'bg-white border border-slate-200 rounded-lg p-2',
  METRIC_LABEL: 'text-xs text-slate-500 mb-1',
  METRIC_VALUE: 'text-sm font-semibold text-slate-900',
  FEATURES_CONTAINER: 'space-y-1.5',
  FEATURE_ROW: 'flex items-start gap-2',
  FEATURE_BULLET: 'rounded-full mt-1.5',
  FEATURE_TEXT: 'text-xs text-slate-700',
  RECOMMENDATION_BOX: 'bg-blue-50 border border-blue-200 rounded-lg p-3',
  RECOMMENDATION_TEXT: 'text-xs text-blue-800',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get card CSS classes based on selection state
 */
function getCardClasses(isSelected: boolean): string {
  const baseClasses = CLASSES.CARD_BASE;
  const stateClasses = isSelected ? CLASSES.CARD_SELECTED : CLASSES.CARD_UNSELECTED;
  return `${baseClasses} ${stateClasses}`;
}

/**
 * Get icon container CSS classes based on selection state
 */
function getIconContainerClasses(isSelected: boolean, bgColor: string): string {
  const baseClasses = CLASSES.ICON_CONTAINER_BASE;
  const stateClasses = isSelected ? CLASSES.ICON_CONTAINER_SELECTED : bgColor;
  return `${baseClasses} ${stateClasses}`;
}

/**
 * Convert text color to bg color class
 */
function textColorToBgColor(textColor: string): string {
  return textColor.replace('text-', 'bg-');
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Metric display box
 */
interface MetricBoxProps {
  label: string;
  value: string;
}

function MetricBox({ label, value }: MetricBoxProps) {
  return (
    <div className={CLASSES.METRIC_BOX}>
      <p className={CLASSES.METRIC_LABEL}>{label}</p>
      <p className={CLASSES.METRIC_VALUE}>{value}</p>
    </div>
  );
}

/**
 * Feature list item
 */
interface FeatureItemProps {
  feature: string;
  color: string;
}

function FeatureItem({ feature, color }: FeatureItemProps) {
  const bulletColor = textColorToBgColor(color);

  return (
    <div className={CLASSES.FEATURE_ROW}>
      <div className={`${ICON_SIZES.SMALL} ${CLASSES.FEATURE_BULLET} ${bulletColor}`} />
      <p className={CLASSES.FEATURE_TEXT}>{feature}</p>
    </div>
  );
}

/**
 * Depth option card
 */
interface DepthCardProps {
  option: DepthOption;
  isSelected: boolean;
  onClick: () => void;
}

function DepthCard({ option, isSelected, onClick }: DepthCardProps) {
  const Icon = option.icon;

  return (
    <Card className={getCardClasses(isSelected)} onClick={onClick}>
      {/* Icon and badge */}
      <div className={CLASSES.HEADER_ROW}>
        <div className={getIconContainerClasses(isSelected, option.bgColor)}>
          <Icon className={`${ICON_SIZES.MEDIUM} ${option.color}`} />
        </div>
        {isSelected && (
          <Badge variant="default" className="text-xs">
            {LABELS.SELECTED_BADGE}
          </Badge>
        )}
      </div>

      {/* Title and description */}
      <h4 className={CLASSES.TITLE}>{option.title}</h4>
      <p className={CLASSES.DESCRIPTION}>{option.description}</p>

      {/* Metrics */}
      <div className={CLASSES.METRICS_GRID}>
        <MetricBox label={LABELS.TIME_LABEL} value={option.time} />
        <MetricBox label={LABELS.QUALITY_LABEL} value={option.quality} />
      </div>

      {/* Features */}
      <div className={CLASSES.FEATURES_CONTAINER}>
        {option.features.map((feature, index) => (
          <FeatureItem key={index} feature={feature} color={option.color} />
        ))}
      </div>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Visual selector for analysis depth level
 */
export function DepthSelector({ value, onChange }: DepthSelectorProps) {
  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleOptionClick = useCallback(
    (optionId: DepthValue) => {
      onChange(optionId);
    },
    [onChange]
  );

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const optionHandlers = useMemo(
    () =>
      DEPTH_OPTIONS.reduce(
        (acc, option) => {
          acc[option.id] = () => handleOptionClick(option.id);
          return acc;
        },
        {} as Record<DepthValue, () => void>
      ),
    [handleOptionClick]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={CLASSES.CONTAINER}>
      {/* Header */}
      <div>
        <h3 className={CLASSES.HEADER_TITLE}>{LABELS.TITLE}</h3>
        <p className={CLASSES.HEADER_SUBTITLE}>{LABELS.SUBTITLE}</p>
      </div>

      {/* Options grid */}
      <div className={CLASSES.GRID}>
        {DEPTH_OPTIONS.map((option) => (
          <DepthCard
            key={option.id}
            option={option}
            isSelected={value === option.id}
            onClick={optionHandlers[option.id]}
          />
        ))}
      </div>

      {/* Recommendation */}
      <div className={CLASSES.RECOMMENDATION_BOX}>
        <p className={CLASSES.RECOMMENDATION_TEXT}>
          {LABELS.RECOMMENDATION_ICON} <strong>{LABELS.RECOMMENDATION_TITLE}</strong>{' '}
          {LABELS.RECOMMENDATION_TEXT}
        </p>
      </div>
    </div>
  );
}
