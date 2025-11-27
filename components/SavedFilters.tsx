'use client';

/**
 * SavedFilters - Filtros Salvos
 * Gerenciamento e aplicação de filtros salvos pelo usuário
 */

import { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { trpc } from '@/lib/trpc/client';
import { Bookmark, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

// ============================================================================
// CONSTANTS
// ============================================================================

const DROPDOWN_WIDTH = 300;

const LABELS = {
  SAVED_FILTERS: 'Filtros Salvos',
  MY_FILTERS: 'Meus Filtros',
} as const;

const TOAST_MESSAGES = {
  DELETE_SUCCESS: 'Filtro deletado com sucesso!',
  DELETE_ERROR: 'Erro ao deletar filtro',
  FILTER_APPLIED: (name: string) => `Filtro "${name}" aplicado!`,
} as const;

// ============================================================================
// TYPES
// ============================================================================

interface SavedFiltersProps {
  onApply: (filtersJson: string) => void;
}

interface SavedFilter {
  id: number;
  name: string;
  filtersJson: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

function SavedFilters({ onApply }: SavedFiltersProps) {
  const utils = trpc.useUtils();
  const { data: savedFilters = [] } = trpc.savedFilters.list.useQuery();

  const deleteMutation = trpc.savedFilters.delete.useMutation({
    onSuccess: () => {
      utils.savedFilters.list.invalidate();
      toast.success(TOAST_MESSAGES.DELETE_SUCCESS);
    },
    onError: () => {
      toast.error(TOAST_MESSAGES.DELETE_ERROR);
    },
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const hasFilters = useMemo(
    () => savedFilters.length > 0,
    [savedFilters.length]
  );

  const filtersCount = useMemo(
    () => savedFilters.length,
    [savedFilters.length]
  );

  const triggerLabel = useMemo(
    () => `${LABELS.SAVED_FILTERS} (${filtersCount})`,
    [filtersCount]
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleApplyFilter = useCallback(
    (filter: SavedFilter) => {
      onApply(filter.filtersJson);
      toast.success(TOAST_MESSAGES.FILTER_APPLIED(filter.name));
    },
    [onApply]
  );

  const handleDeleteFilter = useCallback(
    (e: React.MouseEvent, filterId: number) => {
      e.stopPropagation();
      deleteMutation.mutate(filterId);
    },
    [deleteMutation]
  );

  const handlePreventDefault = useCallback(
    (e: Event) => {
      e.preventDefault();
    },
    []
  );

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderDeleteButton = useCallback(
    (filterId: number) => (
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={(e) => handleDeleteFilter(e, filterId)}
      >
        <Trash2 className="w-3 h-3 text-destructive" />
      </Button>
    ),
    [handleDeleteFilter]
  );

  const renderFilterItem = useCallback(
    (filter: SavedFilter) => (
      <DropdownMenuItem
        key={filter.id}
        className="flex items-center justify-between"
        onSelect={handlePreventDefault}
      >
        <button
          className="flex-1 text-left"
          onClick={() => handleApplyFilter(filter)}
        >
          {filter.name}
        </button>
        {renderDeleteButton(filter.id)}
      </DropdownMenuItem>
    ),
    [handleApplyFilter, handlePreventDefault, renderDeleteButton]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!hasFilters) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Bookmark className="w-4 h-4 mr-2" />
          {triggerLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className={`w-[${DROPDOWN_WIDTH}px]`}>
        <DropdownMenuLabel>{LABELS.MY_FILTERS}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {savedFilters.map(renderFilterItem)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default SavedFilters;
