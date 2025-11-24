import { useMemo } from 'react';
import { Building2, Users, Target, TrendingUp, Search, LucideIcon } from 'lucide-react';

// ============================================================================
// CONSTANTS
// ============================================================================

const ICON_CONFIG = {
  SIZE: 'w-16 h-16',
  STROKE_WIDTH: 1.5,
} as const;

const CLASSES = {
  CONTAINER: 'flex flex-col items-center justify-center py-16 px-4 text-center',
  ICON_WRAPPER: 'mb-4 opacity-40',
  ICON: 'text-muted-foreground',
  TITLE: 'text-lg font-semibold mb-2 text-foreground',
  DESCRIPTION: 'text-sm text-muted-foreground max-w-sm',
} as const;

interface EmptyStateConfig {
  icon: LucideIcon;
  title: string;
  description: string;
}

const EMPTY_STATE_CONFIG: Record<EmptyStateType, EmptyStateConfig> = {
  mercados: {
    icon: Building2,
    title: 'Nenhum mercado encontrado',
    description: 'Comece adicionando seu primeiro mercado para iniciar a pesquisa.',
  },
  clientes: {
    icon: Users,
    title: 'Nenhum cliente neste mercado',
    description: 'Selecione outro mercado ou adicione novos clientes.',
  },
  concorrentes: {
    icon: Target,
    title: 'Nenhum concorrente neste mercado',
    description: 'Selecione outro mercado ou adicione novos concorrentes.',
  },
  leads: {
    icon: TrendingUp,
    title: 'Nenhum lead neste mercado',
    description: 'Selecione outro mercado ou adicione novos leads.',
  },
  search: {
    icon: Search,
    title: 'Nenhum resultado encontrado',
    description: 'Tente ajustar os termos de busca ou filtros aplicados.',
  },
} as const;

const SEARCH_PREFIX = 'Nenhum resultado para';

// ============================================================================
// TYPES
// ============================================================================

type EmptyStateType = 'mercados' | 'clientes' | 'concorrentes' | 'leads' | 'search';

interface EmptyStateProps {
  type: EmptyStateType;
  searchTerm?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getConfig(type: EmptyStateType): EmptyStateConfig {
  return EMPTY_STATE_CONFIG[type];
}

function getDescription(config: EmptyStateConfig, searchTerm?: string): string {
  if (searchTerm) {
    return `${SEARCH_PREFIX} "${searchTerm}". ${config.description}`;
  }
  return config.description;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * EmptyState
 * 
 * Componente para exibir estado vazio com ícone e mensagem contextual.
 * Suporta diferentes tipos de entidades e busca.
 * 
 * @example
 * ```tsx
 * <EmptyState type="mercados" />
 * <EmptyState type="search" searchTerm="teste" />
 * ```
 */
export function EmptyState({ type, searchTerm }: EmptyStateProps) {
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const config = useMemo(() => getConfig(type), [type]);

  const Icon = useMemo(() => config.icon, [config.icon]);

  const description = useMemo(
    () => getDescription(config, searchTerm),
    [config, searchTerm]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={CLASSES.CONTAINER}>
      <div className={CLASSES.ICON_WRAPPER}>
        <Icon
          className={`${ICON_CONFIG.SIZE} ${CLASSES.ICON}`}
          strokeWidth={ICON_CONFIG.STROKE_WIDTH}
        />
      </div>

      <h3 className={CLASSES.TITLE}>{config.title}</h3>

      <p className={CLASSES.DESCRIPTION}>{description}</p>
    </div>
  );
}
