'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { History, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = 'gestor-pav-search-history';
const MAX_HISTORY = 10;

const ICON_SIZES = {
  SMALL: 'w-3 h-3',
  MEDIUM: 'w-4 h-4',
} as const;

const DIMENSIONS = {
  BUTTON: 'h-9 w-9',
  DROPDOWN: 'w-[250px]',
} as const;

const CLASSES = {
  BUTTON: 'p-0',
  EMPTY_STATE: 'px-2 py-4 text-sm text-muted-foreground text-center',
  HEADER: 'px-2 py-1.5 text-xs font-medium text-muted-foreground',
  MENU_ITEM: 'cursor-pointer',
  MENU_ITEM_DESTRUCTIVE: 'cursor-pointer text-destructive',
  ICON_MARGIN: 'mr-2',
  TEXT_TRUNCATE: 'truncate',
} as const;

const LABELS = {
  NO_HISTORY: 'Nenhuma busca recente',
  RECENT_SEARCHES: 'Buscas Recentes',
  CLEAR_HISTORY: 'Limpar Histórico',
  HISTORY_CLEARED: 'Histórico de buscas limpo',
} as const;

const ERROR_MESSAGES = {
  LOAD_ERROR: 'Erro ao carregar histórico de buscas:',
  SAVE_ERROR: 'Erro ao salvar histórico de buscas:',
} as const;

// ============================================================================
// TYPES
// ============================================================================

export interface SearchHistoryProps {
  onSelectSearch: (query: string) => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function loadHistoryFromStorage(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error(ERROR_MESSAGES.LOAD_ERROR, e);
    return [];
  }
}

function saveHistoryToStorage(history: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.error(ERROR_MESSAGES.SAVE_ERROR, e);
  }
}

function clearHistoryFromStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function removeDuplicates(history: string[], query: string): string[] {
  return history.filter((q) => q !== query);
}

function limitHistory(history: string[]): string[] {
  return history.slice(0, MAX_HISTORY);
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function EmptyState() {
  return (
    <div className={CLASSES.EMPTY_STATE}>
      {LABELS.NO_HISTORY}
    </div>
  );
}

function HistoryHeader() {
  return (
    <div className={CLASSES.HEADER}>
      {LABELS.RECENT_SEARCHES}
    </div>
  );
}

interface HistoryItemProps {
  query: string;
  onSelect: (query: string) => void;
}

function HistoryItem({ query, onSelect }: HistoryItemProps) {
  const handleClick = useCallback(() => {
    onSelect(query);
  }, [query, onSelect]);

  return (
    <DropdownMenuItem onClick={handleClick} className={CLASSES.MENU_ITEM}>
      <History className={`${ICON_SIZES.SMALL} ${CLASSES.ICON_MARGIN}`} />
      <span className={CLASSES.TEXT_TRUNCATE}>{query}</span>
    </DropdownMenuItem>
  );
}

interface ClearButtonProps {
  onClear: () => void;
}

function ClearButton({ onClear }: ClearButtonProps) {
  return (
    <DropdownMenuItem onClick={onClear} className={CLASSES.MENU_ITEM_DESTRUCTIVE}>
      <Trash2 className={`${ICON_SIZES.SMALL} ${CLASSES.ICON_MARGIN}`} />
      {LABELS.CLEAR_HISTORY}
    </DropdownMenuItem>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * SearchHistory
 * 
 * Componente que exibe histórico de buscas recentes em um dropdown.
 * Permite selecionar buscas anteriores e limpar o histórico.
 * 
 * @example
 * ```tsx
 * <SearchHistory onSelectSearch={handleSelectSearch} />
 * ```
 */
export default function SearchHistory({ onSelectSearch }: SearchHistoryProps) {
  // State
  const [history, setHistory] = useState<string[]>(() => loadHistoryFromStorage());

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const hasHistory = useMemo(() => history.length > 0, [history.length]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const loadHistory = useCallback(() => {
    const loadedHistory = loadHistoryFromStorage();
    setHistory(loadedHistory);
  }, []);

  const clearHistory = useCallback(() => {
    clearHistoryFromStorage();
    setHistory([]);
    toast.success(LABELS.HISTORY_CLEARED);
  }, []);

  const handleSelectSearch = useCallback(
    (searchTerm: string) => {
      onSelectSearch(searchTerm);
    },
    [onSelectSearch]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={`${DIMENSIONS.BUTTON} ${CLASSES.BUTTON}`}>
          <History className={ICON_SIZES.MEDIUM} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className={DIMENSIONS.DROPDOWN}>
        {!hasHistory ? (
          <EmptyState />
        ) : (
          <>
            <HistoryHeader />
            {history.map((query, index) => (
              <HistoryItem
                key={index}
                query={query}
                onSelect={handleSelectSearch}
              />
            ))}
            <DropdownMenuSeparator />
            <ClearButton onClear={clearHistory} />
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * addToSearchHistory
 * 
 * Função auxiliar para adicionar uma busca ao histórico.
 * Remove duplicatas, adiciona no início e limita ao máximo de itens.
 * 
 * @param query - Termo de busca a ser adicionado ao histórico
 * 
 * @example
 * ```tsx
 * addToSearchHistory('react hooks');
 * ```
 */
export function addToSearchHistory(query: string): void {
  if (!query.trim()) return;

  let history = loadHistoryFromStorage();

  // Remove duplicatas
  history = removeDuplicates(history, query);

  // Adiciona no início
  history.unshift(query);

  // Limita a MAX_HISTORY itens
  history = limitHistory(history);

  saveHistoryToStorage(history);
}
