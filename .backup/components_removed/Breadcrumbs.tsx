'use client';

import { useMemo, useCallback } from 'react';
import { Link } from 'wouter';
import { ChevronRight, Home, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// CONSTANTS
// ============================================================================

const ICON_SIZES = {
  SMALL: 'w-4 h-4',
} as const;

const CLASSES = {
  NAV_BASE: 'flex items-center space-x-1 text-sm text-slate-600 mb-4',
  ITEM_CONTAINER: 'flex items-center',
  CHEVRON: 'mx-1 text-slate-400',
  LINK_BASE: 'flex items-center gap-1 hover:text-blue-600 transition-colors',
  BUTTON_BASE: 'flex items-center gap-1 hover:text-blue-600 transition-colors',
  SPAN_BASE: 'flex items-center gap-1',
  SPAN_LAST: 'text-slate-900 font-medium',
  SPAN_DEFAULT: 'text-slate-600',
} as const;

const ARIA_LABELS = {
  BREADCRUMB: 'Breadcrumb',
} as const;

// ============================================================================
// TYPES
// ============================================================================

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string }> | LucideIcon;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

interface BreadcrumbItemRenderProps {
  item: BreadcrumbItem;
  index: number;
  isFirst: boolean;
  isLast: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function shouldShowDefaultIcon(isFirst: boolean, hasIcon: boolean): boolean {
  return isFirst && !hasIcon;
}

function getSpanClasses(isLast: boolean): string {
  return cn(
    CLASSES.SPAN_BASE,
    isLast ? CLASSES.SPAN_LAST : CLASSES.SPAN_DEFAULT
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function ItemIcon({ 
  Icon, 
  isFirst, 
  hasIcon 
}: { 
  Icon?: React.ComponentType<{ className?: string }> | LucideIcon; 
  isFirst: boolean; 
  hasIcon: boolean;
}) {
  if (Icon) {
    return <Icon className={ICON_SIZES.SMALL} />;
  }

  if (shouldShowDefaultIcon(isFirst, hasIcon)) {
    return <Home className={ICON_SIZES.SMALL} />;
  }

  return null;
}

function BreadcrumbLink({ item, isFirst }: { item: BreadcrumbItem; isFirst: boolean }) {
  const Icon = item.icon;
  const hasIcon = !!Icon;

  return (
    <Link href={item.href!}>
      <a className={CLASSES.LINK_BASE}>
        <ItemIcon Icon={Icon} isFirst={isFirst} hasIcon={hasIcon} />
        <span>{item.label}</span>
      </a>
    </Link>
  );
}

function BreadcrumbButton({ item, isFirst }: { item: BreadcrumbItem; isFirst: boolean }) {
  const Icon = item.icon;
  const hasIcon = !!Icon;

  const handleClick = useCallback(() => {
    item.onClick?.();
  }, [item]);

  return (
    <button onClick={handleClick} className={CLASSES.BUTTON_BASE}>
      <ItemIcon Icon={Icon} isFirst={isFirst} hasIcon={hasIcon} />
      <span>{item.label}</span>
    </button>
  );
}

function BreadcrumbText({ item, isFirst, isLast }: { item: BreadcrumbItem; isFirst: boolean; isLast: boolean }) {
  const Icon = item.icon;
  const hasIcon = !!Icon;
  const spanClasses = useMemo(() => getSpanClasses(isLast), [isLast]);

  return (
    <span className={spanClasses}>
      <ItemIcon Icon={Icon} isFirst={isFirst} hasIcon={hasIcon} />
      <span>{item.label}</span>
    </span>
  );
}

function BreadcrumbItemContent({ item, index, isFirst, isLast }: BreadcrumbItemRenderProps) {
  if (item.href && !isLast) {
    return <BreadcrumbLink item={item} isFirst={isFirst} />;
  }

  if (item.onClick && !isLast) {
    return <BreadcrumbButton item={item} isFirst={isFirst} />;
  }

  return <BreadcrumbText item={item} isFirst={isFirst} isLast={isLast} />;
}

function BreadcrumbItemWrapper({ item, index, isFirst, isLast }: BreadcrumbItemRenderProps) {
  const showChevron = index > 0;

  return (
    <div className={CLASSES.ITEM_CONTAINER}>
      {showChevron && (
        <ChevronRight className={`${ICON_SIZES.SMALL} ${CLASSES.CHEVRON}`} />
      )}
      <BreadcrumbItemContent
        item={item}
        index={index}
        isFirst={isFirst}
        isLast={isLast}
      />
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Breadcrumbs
 * 
 * Componente de breadcrumbs para navegação contextual.
 * Suporta links (href), callbacks (onClick) e ícones customizados.
 * 
 * @example
 * ```tsx
 * <Breadcrumbs items={[
 *   { label: "Início", href: "/", icon: Home },
 *   { label: "Projetos", href: "/projetos" },
 *   { label: "Projeto #1" }
 * ]} />
 * ```
 */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const shouldRender = useMemo(
    () => items && items.length > 0,
    [items]
  );

  const navClasses = useMemo(
    () => cn(CLASSES.NAV_BASE, className),
    [className]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!shouldRender) {
    return null;
  }

  return (
    <nav aria-label={ARIA_LABELS.BREADCRUMB} className={navClasses}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isFirst = index === 0;

        return (
          <BreadcrumbItemWrapper
            key={index}
            item={item}
            index={index}
            isFirst={isFirst}
            isLast={isLast}
          />
        );
      })}
    </nav>
  );
}
