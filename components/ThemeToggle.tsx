'use client';

import { useCallback, useMemo } from 'react';
import { Moon, Sun, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

// ============================================================================
// CONSTANTS
// ============================================================================

const ICON_SIZES = {
  MEDIUM: 'h-5 w-5',
} as const;

const COLORS = {
  SUN: 'text-yellow-500',
  MOON: 'text-slate-700',
} as const;

const CLASSES = {
  BUTTON: 'hover-lift',
} as const;

const ARIA_LABELS = {
  TOGGLE: 'Alternar tema',
} as const;

const THEME_DARK = 'dark';

// ============================================================================
// TYPES
// ============================================================================

interface ThemeIconConfig {
  icon: LucideIcon;
  className: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getThemeIcon(theme: string): ThemeIconConfig {
  const isDark = theme === THEME_DARK;

  return {
    icon: isDark ? Sun : Moon,
    className: `${ICON_SIZES.MEDIUM} ${isDark ? COLORS.SUN : COLORS.MOON}`,
  };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * ThemeToggle
 * 
 * Botão para alternar entre tema claro e escuro.
 * Exibe ícone de sol no tema escuro e lua no tema claro.
 * 
 * @example
 * ```tsx
 * <ThemeToggle />
 * ```
 */
function ThemeToggle() {
  // Context
  const { theme, toggleTheme } = useTheme();

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const iconConfig = useMemo(() => getThemeIcon(theme), [theme]);

  const Icon = useMemo(() => iconConfig.icon, [iconConfig.icon]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleToggle = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className={CLASSES.BUTTON}
      aria-label={ARIA_LABELS.TOGGLE}
    >
      <Icon className={iconConfig.className} />
    </Button>
  );
}

export default ThemeToggle;
