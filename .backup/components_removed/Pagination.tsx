'use client';

import { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

// ============================================================================
// CONSTANTS
// ============================================================================

const ICON_SIZES = {
  SMALL: 'h-4 w-4',
} as const;

const DIMENSIONS = {
  BUTTON: 'h-8 w-8',
  SELECT: 'w-20 h-8',
} as const;

const CLASSES = {
  CONTAINER: 'flex items-center justify-between gap-4 px-2 py-4 border-t border-border/50',
  INFO_SECTION: 'flex items-center gap-4',
  INFO_TEXT: 'text-sm text-muted-foreground',
  INFO_HIGHLIGHT: 'font-medium',
  PAGE_SIZE_CONTAINER: 'flex items-center gap-2',
  PAGE_SIZE_LABEL: 'text-sm text-muted-foreground',
  NAVIGATION: 'flex items-center gap-2',
  PAGE_INFO: 'flex items-center gap-1',
  PAGE_TEXT: 'text-sm font-medium',
} as const;

const LABELS = {
  SHOWING: 'Mostrando',
  TO: 'a',
  OF: 'de',
  RESULTS: 'resultados',
  ITEMS_PER_PAGE: 'Itens por página:',
  PAGE: 'Página',
  OF_PAGES: 'de',
} as const;

const PAGE_SIZE_OPTIONS = ['10', '25', '50', '100'] as const;

const FIRST_PAGE = 1;

// ============================================================================
// TYPES
// ============================================================================

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: string) => void;
  showPageSizeSelector?: boolean;
}

interface ItemRangeInfo {
  startItem: number;
  endItem: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateItemRange(
  currentPage: number,
  pageSize: number,
  totalItems: number
): ItemRangeInfo {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return { startItem, endItem };
}

function isFirstPage(currentPage: number): boolean {
  return currentPage === FIRST_PAGE;
}

function isLastPage(currentPage: number, totalPages: number): boolean {
  return currentPage === totalPages;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function ItemsInfo({ startItem, endItem, totalItems }: ItemRangeInfo & { totalItems: number }) {
  return (
    <p className={CLASSES.INFO_TEXT}>
      {LABELS.SHOWING} <span className={CLASSES.INFO_HIGHLIGHT}>{startItem}</span>{' '}
      {LABELS.TO} <span className={CLASSES.INFO_HIGHLIGHT}>{endItem}</span>{' '}
      {LABELS.OF} <span className={CLASSES.INFO_HIGHLIGHT}>{totalItems}</span>{' '}
      {LABELS.RESULTS}
    </p>
  );
}

function PageSizeSelector({
  pageSize,
  onPageSizeChange,
}: {
  pageSize: number;
  onPageSizeChange: (size: string) => void;
}) {
  const pageSizeString = useMemo(() => pageSize.toString(), [pageSize]);

  return (
    <div className={CLASSES.PAGE_SIZE_CONTAINER}>
      <span className={CLASSES.PAGE_SIZE_LABEL}>{LABELS.ITEMS_PER_PAGE}</span>
      <Select value={pageSizeString} onValueChange={onPageSizeChange}>
        <SelectTrigger className={DIMENSIONS.SELECT}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PAGE_SIZE_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function NavigationButton({
  onClick,
  disabled,
  icon: Icon,
}: {
  onClick: () => void;
  disabled: boolean;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      disabled={disabled}
      className={DIMENSIONS.BUTTON}
    >
      <Icon className={ICON_SIZES.SMALL} />
    </Button>
  );
}

function PageInfo({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  return (
    <div className={CLASSES.PAGE_INFO}>
      <span className={CLASSES.PAGE_TEXT}>
        {LABELS.PAGE} {currentPage} {LABELS.OF_PAGES} {totalPages}
      </span>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Pagination
 * 
 * Componente de paginação com controles de navegação e seletor de itens por página.
 * Exibe informações sobre os itens visíveis e permite navegar entre páginas.
 * 
 * @example
 * ```tsx
 * <Pagination
 *   currentPage={1}
 *   totalPages={10}
 *   totalItems={100}
 *   pageSize={10}
 *   onPageChange={handlePageChange}
 *   onPageSizeChange={handlePageSizeChange}
 * />
 * ```
 */
export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = true,
}: PaginationProps) {
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const itemRange = useMemo(
    () => calculateItemRange(currentPage, pageSize, totalItems),
    [currentPage, pageSize, totalItems]
  );

  const isFirst = useMemo(() => isFirstPage(currentPage), [currentPage]);

  const isLast = useMemo(
    () => isLastPage(currentPage, totalPages),
    [currentPage, totalPages]
  );

  const showPageSize = useMemo(
    () => showPageSizeSelector && !!onPageSizeChange,
    [showPageSizeSelector, onPageSizeChange]
  );

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleFirstPage = useCallback(() => {
    onPageChange(FIRST_PAGE);
  }, [onPageChange]);

  const handlePreviousPage = useCallback(() => {
    onPageChange(currentPage - 1);
  }, [currentPage, onPageChange]);

  const handleNextPage = useCallback(() => {
    onPageChange(currentPage + 1);
  }, [currentPage, onPageChange]);

  const handleLastPage = useCallback(() => {
    onPageChange(totalPages);
  }, [totalPages, onPageChange]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={CLASSES.CONTAINER}>
      <div className={CLASSES.INFO_SECTION}>
        <ItemsInfo {...itemRange} totalItems={totalItems} />

        {showPageSize && (
          <PageSizeSelector pageSize={pageSize} onPageSizeChange={onPageSizeChange!} />
        )}
      </div>

      <div className={CLASSES.NAVIGATION}>
        <NavigationButton
          onClick={handleFirstPage}
          disabled={isFirst}
          icon={ChevronsLeft}
        />
        <NavigationButton
          onClick={handlePreviousPage}
          disabled={isFirst}
          icon={ChevronLeft}
        />

        <PageInfo currentPage={currentPage} totalPages={totalPages} />

        <NavigationButton
          onClick={handleNextPage}
          disabled={isLast}
          icon={ChevronRight}
        />
        <NavigationButton
          onClick={handleLastPage}
          disabled={isLast}
          icon={ChevronsRight}
        />
      </div>
    </div>
  );
}
