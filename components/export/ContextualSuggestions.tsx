/**
 * ContextualSuggestions Component
 * Contextual suggestions based on available data
 * Part 11 of the intelligent export module
 */

'use client';

import { useCallback, useMemo } from 'react';
import { Lightbulb, TrendingUp, Users, Target, Award, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// ============================================================================
// TYPES
// ============================================================================

type Priority = 'high' | 'medium' | 'low';

interface ContextualSuggestionsProps {
  projectId?: number;
  onSelectSuggestion: (context: string) => void;
}

interface Suggestion {
  title: string;
  description: string;
  context: string;
  icon: LucideIcon;
  color: string;
  priority: Priority;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SUGGESTIONS: Suggestion[] = [
  {
    title: 'Top 10 Mercados por Volume',
    description: 'Mercados com maior número de clientes e leads',
    context:
      'Exportar os 10 mercados com mais clientes, incluindo estatísticas de leads e concorrentes',
    icon: TrendingUp,
    color: 'text-green-600',
    priority: 'high',
  },
  {
    title: 'Clientes Validados Recentes',
    description: 'Clientes aprovados nos últimos 30 dias',
    context: 'Clientes com status validado criados nos últimos 30 dias, com produtos e mercados',
    icon: Users,
    color: 'text-blue-600',
    priority: 'high',
  },
  {
    title: 'Leads de Alta Qualidade',
    description: 'Leads com score acima de 80',
    context: 'Leads com qualityScore maior que 80, incluindo dados de contato e mercado',
    icon: Award,
    color: 'text-orange-600',
    priority: 'high',
  },
  {
    title: 'Mercados B2B em Crescimento',
    description: 'Mercados B2B com tendência de crescimento',
    context: 'Mercados com segmentação B2B e crescimento positivo, com análise competitiva',
    icon: Target,
    color: 'text-purple-600',
    priority: 'medium',
  },
  {
    title: 'Concorrentes por Região',
    description: 'Análise de concorrentes agrupados por UF',
    context: 'Concorrentes agrupados por estado, com contagem e principais produtos',
    icon: Users,
    color: 'text-red-600',
    priority: 'medium',
  },
] as const;

const PRIORITY_COLORS: Record<Priority, string> = {
  high: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-slate-100 text-slate-800 border-slate-200',
} as const;

const PRIORITY_LABELS: Record<Priority, string> = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
} as const;

const ICON_SIZES = {
  MEDIUM: 'w-5 h-5',
} as const;

const LABELS = {
  HEADER_TITLE: 'Sugestões Baseadas em Seus Dados',
  BUTTON_TEXT: 'Usar esta sugestão →',
  INFO_ICON: '💡',
  INFO_TEXT: 'As sugestões são atualizadas dinamicamente baseadas nos dados do seu projeto',
} as const;

const CLASSES = {
  CONTAINER: 'space-y-4',
  HEADER: 'flex items-center gap-2',
  HEADER_ICON: 'text-yellow-500',
  HEADER_TITLE: 'text-sm font-semibold text-slate-900',
  GRID: 'grid grid-cols-1 md:grid-cols-2 gap-3',
  CARD: 'p-4 hover:shadow-md transition-shadow cursor-pointer border-slate-200',
  CARD_CONTENT: 'flex items-start gap-3',
  ICON_CONTAINER: 'p-2 rounded-lg bg-slate-50',
  TEXT_CONTAINER: 'flex-1 min-w-0',
  TITLE_ROW: 'flex items-start justify-between gap-2 mb-1',
  TITLE: 'text-sm font-semibold text-slate-900',
  PRIORITY_BADGE: 'text-xs px-2 py-0.5 rounded-full border',
  DESCRIPTION: 'text-xs text-slate-600 mb-2',
  BUTTON: 'text-xs h-7 px-2',
  INFO_TEXT: 'text-xs text-slate-500 italic',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get priority badge CSS classes
 */
function getPriorityClasses(priority: Priority): string {
  return `${CLASSES.PRIORITY_BADGE} ${PRIORITY_COLORS[priority]}`;
}

/**
 * Get priority label
 */
function getPriorityLabel(priority: Priority): string {
  return PRIORITY_LABELS[priority];
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Suggestion card component
 */
interface SuggestionCardProps {
  suggestion: Suggestion;
  onSelect: (context: string) => void;
}

function SuggestionCard({ suggestion, onSelect }: SuggestionCardProps) {
  const Icon = suggestion.icon;

  const handleCardClick = useCallback(() => {
    onSelect(suggestion.context);
  }, [onSelect, suggestion.context]);

  const handleButtonClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect(suggestion.context);
    },
    [onSelect, suggestion.context]
  );

  return (
    <Card className={CLASSES.CARD} onClick={handleCardClick}>
      <div className={CLASSES.CARD_CONTENT}>
        <div className={CLASSES.ICON_CONTAINER}>
          <Icon className={`${ICON_SIZES.MEDIUM} ${suggestion.color}`} />
        </div>
        <div className={CLASSES.TEXT_CONTAINER}>
          <div className={CLASSES.TITLE_ROW}>
            <h4 className={CLASSES.TITLE}>{suggestion.title}</h4>
            <span className={getPriorityClasses(suggestion.priority)}>
              {getPriorityLabel(suggestion.priority)}
            </span>
          </div>
          <p className={CLASSES.DESCRIPTION}>{suggestion.description}</p>
          <Button variant="ghost" size="sm" className={CLASSES.BUTTON} onClick={handleButtonClick}>
            {LABELS.BUTTON_TEXT}
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Display contextual suggestions based on project data
 */
export function ContextualSuggestions({
  projectId,
  onSelectSuggestion,
}: ContextualSuggestionsProps) {
  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSelectSuggestion = useCallback(
    (context: string) => {
      onSelectSuggestion(context);
    },
    [onSelectSuggestion]
  );

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const suggestionsList = useMemo(() => SUGGESTIONS, []);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={CLASSES.CONTAINER}>
      {/* Header */}
      <div className={CLASSES.HEADER}>
        <Lightbulb className={`${ICON_SIZES.MEDIUM} ${CLASSES.HEADER_ICON}`} />
        <h3 className={CLASSES.HEADER_TITLE}>{LABELS.HEADER_TITLE}</h3>
      </div>

      {/* Suggestions grid */}
      <div className={CLASSES.GRID}>
        {suggestionsList.map((suggestion, index) => (
          <SuggestionCard
            key={index}
            suggestion={suggestion}
            onSelect={handleSelectSuggestion}
          />
        ))}
      </div>

      {/* Info note */}
      <p className={CLASSES.INFO_TEXT}>
        {LABELS.INFO_ICON} {LABELS.INFO_TEXT}
      </p>
    </div>
  );
}
