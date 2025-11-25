'use client';

import { useCallback, useMemo } from 'react';
import { useCompactMode } from '@/contexts/CompactModeContext';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, LucideIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// ============================================================================
// CONSTANTS
// ============================================================================

const ICON_SIZES = {
  SMALL: 'h-4 w-4',
} as const;

const CLASSES = {
  BUTTON: 'transition-all duration-200 hover:scale-110',
  DESCRIPTION: 'text-xs text-muted-foreground',
} as const;

const LABELS = {
  COMPACT: 'Modo Compacto',
  NORMAL: 'Modo Normal',
  DESCRIPTION: 'Ajusta densidade da interface',
} as const;

const ICONS: Record<'compact' | 'normal', LucideIcon> = {
  compact: Minimize2,
  normal: Maximize2,
} as const;

// ============================================================================
// TYPES
// ============================================================================

interface TooltipConfig {
  title: string;
  description: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getTooltipConfig(isCompact: boolean): TooltipConfig {
  return {
    title: isCompact ? LABELS.NORMAL : LABELS.COMPACT,
    description: LABELS.DESCRIPTION,
  };
}

function getIcon(isCompact: boolean): LucideIcon {
  return isCompact ? ICONS.normal : ICONS.compact;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CompactModeToggle() {
  // Context
  const { isCompact, toggleCompact } = useCompactMode();

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const tooltipConfig = useMemo(
    () => getTooltipConfig(isCompact),
    [isCompact]
  );

  const IconComponent = getIcon(isCompact);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleToggle = useCallback(() => {
    toggleCompact();
  }, [toggleCompact]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          className={CLASSES.BUTTON}
        >
          <IconComponent className={ICON_SIZES.SMALL} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltipConfig.title}</p>
        <p className={CLASSES.DESCRIPTION}>{tooltipConfig.description}</p>
      </TooltipContent>
    </Tooltip>
  );
}
