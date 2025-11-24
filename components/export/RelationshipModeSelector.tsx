/**
 * RelationshipModeSelector Component
 * Selector for relationship depth (joins)
 * Part 12 of the intelligent export module
 */

'use client';

import { useCallback, useMemo } from 'react';
import { Zap, Layers, Network, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// ============================================================================
// TYPES
// ============================================================================

type RelationshipMode = 'direct' | 'extended' | 'full';

interface RelationshipModeSelectorProps {
  value: RelationshipMode;
  onChange: (mode: RelationshipMode) => void;
}

interface Mode {
  id: RelationshipMode;
  title: string;
  description: string;
  example: string;
  icon: LucideIcon;
  color: string;
  levels: number;
  performance: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MODES: Mode[] = [
  {
    id: 'direct',
    title: 'Direto',
    description: 'Apenas relacionamentos de 1º nível',
    example: 'Cliente → Produtos',
    icon: Zap,
    color: 'text-green-600',
    levels: 1,
    performance: 'Rápido',
  },
  {
    id: 'extended',
    title: 'Estendido',
    description: 'Relacionamentos até 2º nível',
    example: 'Cliente → Produtos → Mercados',
    icon: Layers,
    color: 'text-blue-600',
    levels: 2,
    performance: 'Moderado',
  },
  {
    id: 'full',
    title: 'Completo',
    description: 'Todos os relacionamentos (3+ níveis)',
    example: 'Cliente → Produtos → Mercados → Concorrentes',
    icon: Network,
    color: 'text-purple-600',
    levels: 3,
    performance: 'Lento',
  },
] as const;

const RELATIONSHIP_TABLES: Record<RelationshipMode, string[]> = {
  direct: ['Entidade Principal', 'Relacionamento Direto'],
  extended: ['Entidade Principal', 'Relacionamento Direto', 'Relacionamento de 2º Nível'],
  full: [
    'Entidade Principal',
    'Relacionamento Direto',
    'Relacionamento de 2º Nível',
    'Relacionamento de 3º Nível',
    'Relacionamentos Adicionais',
  ],
} as const;

const LABELS = {
  TITLE: 'Profundidade de Relacionamentos',
  SUBTITLE: 'Define quantos níveis de relacionamento serão incluídos na exportação',
  SELECTED_BADGE: 'Selecionado',
  LEVEL_SINGULAR: 'nível',
  LEVEL_PLURAL: 'níveis',
  TABLES_TITLE: 'Tabelas que serão incluídas:',
  WARNING_ICON: '⚠️',
  WARNING_TITLE: 'Atenção:',
  WARNING_TEXT:
    'Modo completo pode gerar arquivos grandes e demorar mais tempo para processar. Considere adicionar filtros para reduzir o volume de dados.',
} as const;

const ICON_SIZES = {
  MEDIUM: 'w-5 h-5',
} as const;

const CLASSES = {
  CONTAINER: 'space-y-4',
  HEADER_TITLE: 'text-sm font-semibold text-slate-900 mb-1',
  HEADER_SUBTITLE: 'text-xs text-slate-600',
  GRID: 'grid grid-cols-1 md:grid-cols-3 gap-3',
  CARD_BASE: 'p-4 cursor-pointer transition-all',
  CARD_SELECTED: 'border-blue-500 bg-blue-50 shadow-md',
  CARD_UNSELECTED: 'border-slate-200 hover:border-slate-300 hover:shadow-sm',
  ICON_CONTAINER_BASE: 'p-2 rounded-lg',
  ICON_CONTAINER_SELECTED: 'bg-white',
  ICON_CONTAINER_UNSELECTED: 'bg-slate-50',
  HEADER_ROW: 'flex items-start justify-between mb-3',
  TITLE: 'font-semibold text-slate-900 mb-1',
  DESCRIPTION: 'text-xs text-slate-600 mb-3',
  EXAMPLE_BOX: 'bg-white border border-slate-200 rounded p-2 mb-3',
  EXAMPLE_TEXT: 'text-xs text-slate-700 font-mono',
  METADATA_ROW: 'flex items-center justify-between text-xs',
  METADATA_LABEL: 'text-slate-600',
  TABLES_BOX: 'bg-slate-50 border border-slate-200 rounded-lg p-3',
  TABLES_TITLE: 'text-xs font-semibold text-slate-900 mb-2',
  TABLES_BADGES: 'flex flex-wrap gap-2',
  WARNING_BOX: 'bg-yellow-50 border border-yellow-200 rounded-lg p-3',
  WARNING_TEXT: 'text-xs text-yellow-800',
} as const;

const FULL_MODE = 'full' as const;

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
function getIconContainerClasses(isSelected: boolean): string {
  const baseClasses = CLASSES.ICON_CONTAINER_BASE;
  const stateClasses = isSelected
    ? CLASSES.ICON_CONTAINER_SELECTED
    : CLASSES.ICON_CONTAINER_UNSELECTED;
  return `${baseClasses} ${stateClasses}`;
}

/**
 * Get level label (singular or plural)
 */
function getLevelLabel(levels: number): string {
  return levels === 1 ? LABELS.LEVEL_SINGULAR : LABELS.LEVEL_PLURAL;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Mode card component
 */
interface ModeCardProps {
  mode: Mode;
  isSelected: boolean;
  onClick: () => void;
}

function ModeCard({ mode, isSelected, onClick }: ModeCardProps) {
  const Icon = mode.icon;

  return (
    <Card className={getCardClasses(isSelected)} onClick={onClick}>
      {/* Icon and title */}
      <div className={CLASSES.HEADER_ROW}>
        <div className={getIconContainerClasses(isSelected)}>
          <Icon className={`${ICON_SIZES.MEDIUM} ${mode.color}`} />
        </div>
        {isSelected && (
          <Badge variant="default" className="text-xs">
            {LABELS.SELECTED_BADGE}
          </Badge>
        )}
      </div>

      {/* Title and description */}
      <h4 className={CLASSES.TITLE}>{mode.title}</h4>
      <p className={CLASSES.DESCRIPTION}>{mode.description}</p>

      {/* Example */}
      <div className={CLASSES.EXAMPLE_BOX}>
        <p className={CLASSES.EXAMPLE_TEXT}>{mode.example}</p>
      </div>

      {/* Metadata */}
      <div className={CLASSES.METADATA_ROW}>
        <span className={CLASSES.METADATA_LABEL}>
          {mode.levels} {getLevelLabel(mode.levels)}
        </span>
        <Badge variant="secondary" className="text-xs">
          {mode.performance}
        </Badge>
      </div>
    </Card>
  );
}

/**
 * Tables preview component
 */
interface TablesPreviewProps {
  tables: string[];
}

function TablesPreview({ tables }: TablesPreviewProps) {
  return (
    <div className={CLASSES.TABLES_BOX}>
      <h4 className={CLASSES.TABLES_TITLE}>{LABELS.TABLES_TITLE}</h4>
      <div className={CLASSES.TABLES_BADGES}>
        {tables.map((table) => (
          <Badge key={table} variant="outline">
            {table}
          </Badge>
        ))}
      </div>
    </div>
  );
}

/**
 * Performance warning component
 */
function PerformanceWarning() {
  return (
    <div className={CLASSES.WARNING_BOX}>
      <p className={CLASSES.WARNING_TEXT}>
        {LABELS.WARNING_ICON} <strong>{LABELS.WARNING_TITLE}</strong> {LABELS.WARNING_TEXT}
      </p>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Selector for relationship depth level
 */
export function RelationshipModeSelector({ value, onChange }: RelationshipModeSelectorProps) {
  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleModeClick = useCallback(
    (modeId: RelationshipMode) => {
      onChange(modeId);
    },
    [onChange]
  );

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const modeHandlers = useMemo(
    () =>
      MODES.reduce(
        (acc, mode) => {
          acc[mode.id] = () => handleModeClick(mode.id);
          return acc;
        },
        {} as Record<RelationshipMode, () => void>
      ),
    [handleModeClick]
  );

  const selectedTables = useMemo(() => RELATIONSHIP_TABLES[value], [value]);

  const showWarning = useMemo(() => value === FULL_MODE, [value]);

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

      {/* Modes grid */}
      <div className={CLASSES.GRID}>
        {MODES.map((mode) => (
          <ModeCard
            key={mode.id}
            mode={mode}
            isSelected={value === mode.id}
            onClick={modeHandlers[mode.id]}
          />
        ))}
      </div>

      {/* Tables preview */}
      <TablesPreview tables={selectedTables} />

      {/* Performance warning */}
      {showWarning && <PerformanceWarning />}
    </div>
  );
}
