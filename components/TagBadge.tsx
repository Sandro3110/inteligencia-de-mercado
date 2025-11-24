'use client';

import { useCallback, useMemo } from 'react';
import { X } from 'lucide-react';
import { Badge } from './ui/badge';

// ============================================================================
// CONSTANTS
// ============================================================================

const ICON_SIZES = {
  SMALL: 'w-3 h-3',
} as const;

const TEXT_SIZES = {
  SMALL: 'text-[10px]',
  MEDIUM: 'text-[11px]',
} as const;

const PADDING = {
  SMALL: 'px-1.5 py-0.5',
  MEDIUM: 'px-2 py-0.5',
} as const;

const CLASSES = {
  BADGE_BASE: 'font-medium inline-flex items-center gap-1',
  REMOVE_BUTTON: 'hover:opacity-70 transition-opacity',
} as const;

const ARIA_LABELS = {
  REMOVE: 'Remover tag',
} as const;

const OPACITY_SUFFIX = '20';

// ============================================================================
// TYPES
// ============================================================================

type TagSize = 'sm' | 'md';

export interface TagBadgeProps {
  name: string;
  color: string;
  onRemove?: () => void;
  size?: TagSize;
}

interface BadgeStyleConfig {
  backgroundColor: string;
  color: string;
  borderColor: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getTextSize(size: TagSize): string {
  return size === 'sm' ? TEXT_SIZES.SMALL : TEXT_SIZES.MEDIUM;
}

function getPadding(size: TagSize): string {
  return size === 'sm' ? PADDING.SMALL : PADDING.MEDIUM;
}

function getBadgeClasses(size: TagSize): string {
  const textSize = getTextSize(size);
  const padding = getPadding(size);

  return `${textSize} ${padding} ${CLASSES.BADGE_BASE}`;
}

function getBadgeStyle(color: string): BadgeStyleConfig {
  return {
    backgroundColor: `${color}${OPACITY_SUFFIX}`,
    color: color,
    borderColor: color,
  };
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function RemoveButton({ onRemove }: { onRemove: () => void }) {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove();
    },
    [onRemove]
  );

  return (
    <button
      onClick={handleClick}
      className={CLASSES.REMOVE_BUTTON}
      aria-label={ARIA_LABELS.REMOVE}
    >
      <X className={ICON_SIZES.SMALL} />
    </button>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * TagBadge
 * 
 * Badge para exibir tags com cor personalizada e botão opcional de remoção.
 * Suporta dois tamanhos: small (sm) e medium (md).
 * 
 * @example
 * ```tsx
 * <TagBadge name="Important" color="#ff0000" />
 * <TagBadge name="Todo" color="#00ff00" onRemove={handleRemove} size="sm" />
 * ```
 */
export function TagBadge({
  name,
  color,
  onRemove,
  size = 'md',
}: TagBadgeProps) {
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const badgeClasses = useMemo(() => getBadgeClasses(size), [size]);

  const badgeStyle = useMemo(() => getBadgeStyle(color), [color]);

  const showRemoveButton = useMemo(() => !!onRemove, [onRemove]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Badge className={badgeClasses} style={badgeStyle}>
      {name}
      {showRemoveButton && <RemoveButton onRemove={onRemove!} />}
    </Badge>
  );
}
