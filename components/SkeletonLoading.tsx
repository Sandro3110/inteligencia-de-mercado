/**
 * Skeleton Loading Components
 * 
 * Componentes de skeleton para substituir spinners e melhorar a percepção de performance.
 * Exibem placeholders animados enquanto o conteúdo real está carregando.
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const DIMENSIONS = {
  ICON_SMALL: 'h-4 w-4',
  ICON_MEDIUM: 'h-5 w-5',
  TEXT_SMALL: 'h-4',
  TEXT_MEDIUM: 'h-5',
  WIDTH_QUARTER: 'w-1/4',
  WIDTH_HALF: 'w-1/2',
  WIDTH_TWO_THIRDS: 'w-2/3',
  WIDTH_THREE_QUARTERS: 'w-3/4',
  WIDTH_12: 'w-12',
  WIDTH_16: 'w-16',
  WIDTH_24: 'w-24',
} as const;

const CLASSES = {
  CARD_BASE: 'flex items-center gap-3 p-4 rounded-lg border border-border/40 animate-pulse',
  CONTENT: 'flex-1 space-y-2',
  ROW: 'flex items-center gap-2',
  ROW_WITH_MARGIN: 'flex items-center gap-2 mt-2',
  SKELETON_BG: 'bg-muted rounded',
  SKELETON_CIRCLE: 'bg-muted rounded-full',
  LIST_CONTAINER: 'space-y-2',
} as const;

const DEFAULT_LIST_COUNT = 5;

// ============================================================================
// TYPES
// ============================================================================

interface SkeletonListProps {
  count?: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function createSkeletonArray(count: number): number[] {
  return Array.from({ length: count }, (_, i) => i);
}

// ============================================================================
// BASE COMPONENTS
// ============================================================================

function SkeletonBox({ className }: { className: string }) {
  return <div className={`${CLASSES.SKELETON_BG} ${className}`} />;
}

function SkeletonCircle({ className }: { className: string }) {
  return <div className={`${CLASSES.SKELETON_CIRCLE} ${className}`} />;
}

// ============================================================================
// CARD COMPONENTS
// ============================================================================

/**
 * SkeletonCard
 * 
 * Skeleton básico para cards genéricos.
 */
export function SkeletonCard() {
  return (
    <div className={CLASSES.CARD_BASE}>
      <div className={CLASSES.CONTENT}>
        <SkeletonBox className={`${DIMENSIONS.TEXT_MEDIUM} ${DIMENSIONS.WIDTH_THREE_QUARTERS}`} />
        <SkeletonBox className={`${DIMENSIONS.TEXT_SMALL} ${DIMENSIONS.WIDTH_HALF}`} />
      </div>
      <SkeletonBox className={DIMENSIONS.ICON_MEDIUM} />
    </div>
  );
}

/**
 * SkeletonList
 * 
 * Lista de skeleton cards.
 * 
 * @param count - Número de cards a exibir (padrão: 5)
 */
export function SkeletonList({ count = DEFAULT_LIST_COUNT }: SkeletonListProps) {
  const items = createSkeletonArray(count);

  return (
    <div className={CLASSES.LIST_CONTAINER}>
      {items.map((i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/**
 * SkeletonMercado
 * 
 * Skeleton específico para cards de mercado.
 */
export function SkeletonMercado() {
  return (
    <div className={CLASSES.CARD_BASE}>
      <div className={CLASSES.CONTENT}>
        <SkeletonBox className={`${DIMENSIONS.TEXT_MEDIUM} ${DIMENSIONS.WIDTH_THREE_QUARTERS}`} />
        <div className={CLASSES.ROW_WITH_MARGIN}>
          <SkeletonBox className={`${DIMENSIONS.TEXT_SMALL} ${DIMENSIONS.WIDTH_16}`} />
          <SkeletonBox className={`${DIMENSIONS.TEXT_SMALL} ${DIMENSIONS.WIDTH_24}`} />
        </div>
      </div>
      <SkeletonBox className={DIMENSIONS.ICON_MEDIUM} />
    </div>
  );
}

/**
 * SkeletonCliente
 * 
 * Skeleton específico para cards de cliente.
 */
export function SkeletonCliente() {
  return (
    <div className={CLASSES.CARD_BASE}>
      <SkeletonBox className={DIMENSIONS.ICON_MEDIUM} />
      <div className={CLASSES.CONTENT}>
        <div className={CLASSES.ROW}>
          <SkeletonCircle className={DIMENSIONS.ICON_SMALL} />
          <SkeletonBox className={`${DIMENSIONS.TEXT_MEDIUM} ${DIMENSIONS.WIDTH_HALF}`} />
          <SkeletonBox className={`${DIMENSIONS.TEXT_MEDIUM} ${DIMENSIONS.WIDTH_12}`} />
          <SkeletonBox className={`${DIMENSIONS.TEXT_MEDIUM} ${DIMENSIONS.WIDTH_12}`} />
        </div>
        <SkeletonBox className={`${DIMENSIONS.TEXT_SMALL} ${DIMENSIONS.WIDTH_THREE_QUARTERS}`} />
      </div>
    </div>
  );
}

/**
 * SkeletonConcorrente
 * 
 * Skeleton específico para cards de concorrente.
 */
export function SkeletonConcorrente() {
  return (
    <div className={CLASSES.CARD_BASE}>
      <SkeletonBox className={DIMENSIONS.ICON_MEDIUM} />
      <div className={CLASSES.CONTENT}>
        <div className={CLASSES.ROW}>
          <SkeletonCircle className={DIMENSIONS.ICON_SMALL} />
          <SkeletonBox className={`${DIMENSIONS.TEXT_MEDIUM} ${DIMENSIONS.WIDTH_HALF}`} />
          <SkeletonBox className={`${DIMENSIONS.TEXT_MEDIUM} ${DIMENSIONS.WIDTH_16}`} />
          <SkeletonBox className={`${DIMENSIONS.TEXT_MEDIUM} ${DIMENSIONS.WIDTH_12}`} />
        </div>
        <SkeletonBox className={`${DIMENSIONS.TEXT_SMALL} ${DIMENSIONS.WIDTH_TWO_THIRDS}`} />
      </div>
    </div>
  );
}

/**
 * SkeletonLead
 * 
 * Skeleton específico para cards de lead.
 */
export function SkeletonLead() {
  return (
    <div className={CLASSES.CARD_BASE}>
      <SkeletonBox className={DIMENSIONS.ICON_MEDIUM} />
      <div className={CLASSES.CONTENT}>
        <div className={CLASSES.ROW}>
          <SkeletonCircle className={DIMENSIONS.ICON_SMALL} />
          <SkeletonBox className={`${DIMENSIONS.TEXT_MEDIUM} ${DIMENSIONS.WIDTH_HALF}`} />
          <SkeletonBox className={`${DIMENSIONS.TEXT_MEDIUM} ${DIMENSIONS.WIDTH_16}`} />
          <SkeletonBox className={`${DIMENSIONS.TEXT_MEDIUM} ${DIMENSIONS.WIDTH_12}`} />
        </div>
        <SkeletonBox className={`${DIMENSIONS.TEXT_SMALL} ${DIMENSIONS.WIDTH_HALF}`} />
      </div>
    </div>
  );
}
