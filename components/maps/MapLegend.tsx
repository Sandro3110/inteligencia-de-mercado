/**
 * MapLegend Component
 * Unified map legend
 * Shows entity counters by type with standardized colors
 */

'use client';

import { useMemo, useCallback } from 'react';
import { Building, Users, Package, Target, Sparkles, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// ============================================================================
// TYPES
// ============================================================================

export interface MapLegendProps {
  stats: {
    mercado: number;
    cliente: number;
    produto: number;
    concorrente: number;
    lead: number;
  };
  activeTypes: Set<string>;
  onToggleType?: (type: string) => void;
}

interface EntityConfig {
  label: string;
  icon: LucideIcon;
  color: string;
  textColor: string;
  bgLight: string;
}

type EntityType = keyof MapLegendProps['stats'];

// ============================================================================
// CONSTANTS
// ============================================================================

const ENTITY_CONFIG: Record<EntityType, EntityConfig> = {
  mercado: {
    label: 'Mercados',
    icon: Building,
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgLight: 'bg-blue-50',
  },
  cliente: {
    label: 'Clientes',
    icon: Users,
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgLight: 'bg-green-50',
  },
  produto: {
    label: 'Produtos',
    icon: Package,
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgLight: 'bg-yellow-50',
  },
  concorrente: {
    label: 'Concorrentes',
    icon: Target,
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgLight: 'bg-red-50',
  },
  lead: {
    label: 'Leads',
    icon: Sparkles,
    color: 'bg-purple-500',
    textColor: 'text-purple-700',
    bgLight: 'bg-purple-50',
  },
} as const;

const ICON_SIZES = {
  SMALL: 'w-3 h-3',
  MEDIUM: 'w-4 h-4',
} as const;

const LABELS = {
  TITLE: 'Legenda do Mapa',
  TOTAL_SUFFIX: 'total',
  HINT: 'Clique para mostrar/ocultar camadas',
} as const;

const CLASSES = {
  CARD: 'absolute top-4 right-4 z-[1000] shadow-lg',
  CONTENT: 'p-4 space-y-3',
  HEADER: 'flex items-center justify-between',
  TITLE: 'font-semibold text-sm',
  TOTAL_BADGE: 'text-xs',
  ITEMS_CONTAINER: 'space-y-2',
  ITEM_BUTTON_BASE: 'w-full flex items-center justify-between p-2 rounded-md transition-all hover:shadow-sm',
  ITEM_BUTTON_INACTIVE: 'bg-gray-50 opacity-50',
  ITEM_LEFT: 'flex items-center gap-2',
  ITEM_INDICATOR: 'rounded-full',
  ITEM_TEXT_ACTIVE: 'text-sm font-medium',
  ITEM_TEXT_INACTIVE: 'text-sm text-gray-400',
  ITEM_ICON_INACTIVE: 'text-gray-400',
  ITEM_BADGE_INACTIVE: 'text-gray-400',
  FOOTER: 'pt-2 border-t text-xs text-muted-foreground',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate total count from stats
 */
function calculateTotal(stats: MapLegendProps['stats']): number {
  return Object.values(stats).reduce((sum, count) => sum + count, 0);
}

/**
 * Get button CSS classes based on active state
 */
function getButtonClasses(isActive: boolean, bgLight: string): string {
  const baseClasses = CLASSES.ITEM_BUTTON_BASE;
  const stateClasses = isActive ? bgLight : CLASSES.ITEM_BUTTON_INACTIVE;
  return `${baseClasses} ${stateClasses}`;
}

/**
 * Get icon CSS classes based on active state
 */
function getIconClasses(isActive: boolean, textColor: string): string {
  return `${ICON_SIZES.MEDIUM} ${isActive ? textColor : CLASSES.ITEM_ICON_INACTIVE}`;
}

/**
 * Get text CSS classes based on active state
 */
function getTextClasses(isActive: boolean): string {
  return isActive ? CLASSES.ITEM_TEXT_ACTIVE : CLASSES.ITEM_TEXT_INACTIVE;
}

/**
 * Get badge variant based on active state
 */
function getBadgeVariant(isActive: boolean): 'default' | 'outline' {
  return isActive ? 'default' : 'outline';
}

/**
 * Get badge CSS classes based on active state
 */
function getBadgeClasses(isActive: boolean): string {
  return `${CLASSES.TOTAL_BADGE} ${isActive ? '' : CLASSES.ITEM_BADGE_INACTIVE}`;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Legend item component
 */
interface LegendItemProps {
  type: EntityType;
  config: EntityConfig;
  count: number;
  isActive: boolean;
  onToggle: (type: string) => void;
}

function LegendItem({ type, config, count, isActive, onToggle }: LegendItemProps) {
  const Icon = config.icon;

  const handleClick = useCallback(() => {
    onToggle(type);
  }, [onToggle, type]);

  return (
    <button onClick={handleClick} className={getButtonClasses(isActive, config.bgLight)}>
      <div className={CLASSES.ITEM_LEFT}>
        <div className={`${ICON_SIZES.SMALL} ${CLASSES.ITEM_INDICATOR} ${config.color}`} />
        <Icon className={getIconClasses(isActive, config.textColor)} />
        <span className={getTextClasses(isActive)}>{config.label}</span>
      </div>
      <Badge variant={getBadgeVariant(isActive)} className={getBadgeClasses(isActive)}>
        {count}
      </Badge>
    </button>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Map legend with entity counters and layer toggle
 */
export default function MapLegend({ stats, activeTypes, onToggleType }: MapLegendProps) {
  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleToggleType = useCallback(
    (type: string) => {
      onToggleType?.(type);
    },
    [onToggleType]
  );

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const total = useMemo(() => calculateTotal(stats), [stats]);

  const entityEntries = useMemo(
    () => Object.entries(ENTITY_CONFIG) as [EntityType, EntityConfig][],
    []
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Card className={CLASSES.CARD}>
      <CardContent className={CLASSES.CONTENT}>
        {/* Header */}
        <div className={CLASSES.HEADER}>
          <h3 className={CLASSES.TITLE}>{LABELS.TITLE}</h3>
          <Badge variant="outline" className={CLASSES.TOTAL_BADGE}>
            {total} {LABELS.TOTAL_SUFFIX}
          </Badge>
        </div>

        {/* Legend items */}
        <div className={CLASSES.ITEMS_CONTAINER}>
          {entityEntries.map(([type, config]) => (
            <LegendItem
              key={type}
              type={type}
              config={config}
              count={stats[type]}
              isActive={activeTypes.has(type)}
              onToggle={handleToggleType}
            />
          ))}
        </div>

        {/* Footer hint */}
        <div className={CLASSES.FOOTER}>{LABELS.HINT}</div>
      </CardContent>
    </Card>
  );
}
