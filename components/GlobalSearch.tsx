'use client';

/**
 * GlobalSearch - Busca Global do Sistema
 * Busca unificada por mercados, clientes, concorrentes e leads
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { trpc } from '@/lib/trpc/client';
import { useSelectedProject } from '@/hooks/useSelectedProject';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Search,
  Building2,
  Users,
  Target,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';

// ============================================================================
// CONSTANTS
// ============================================================================

const SEARCH_CONFIG = {
  LIMIT: 50,
  MIN_QUERY_LENGTH: 1,
  FUZZY_THRESHOLD: 0.3,
  FUZZY_MIN_LENGTH: 3,
  FOCUS_DELAY: 100,
} as const;

const SEARCH_KEYS = ['title', 'subtitle'] as const;

const PLACEHOLDERS = {
  INPUT: 'Buscar mercados, clientes, concorrentes, leads...',
  EMPTY_STATE: 'Digite para buscar...',
  EMPTY_SUBTITLE: 'Mercados, clientes, concorrentes e leads',
  NO_RESULTS: 'Nenhum resultado encontrado',
  NO_RESULTS_HINT: 'Tente buscar por nome, CNPJ ou email',
} as const;

const KEYBOARD_HINTS = {
  NAVIGATE: 'Navegar',
  SELECT: 'Selecionar',
  CLOSE: 'Fechar',
} as const;

const KEYBOARD_KEYS = {
  UP: '↑↓',
  ENTER: 'Enter',
  ESC: 'Esc',
} as const;

const ENTITY_TYPES = {
  MERCADO: 'mercado',
  CLIENTE: 'cliente',
  CONCORRENTE: 'concorrente',
  LEAD: 'lead',
} as const;

const TYPE_LABELS: Record<string, string> = {
  [ENTITY_TYPES.MERCADO]: 'Mercado',
  [ENTITY_TYPES.CLIENTE]: 'Cliente',
  [ENTITY_TYPES.CONCORRENTE]: 'Concorrente',
  [ENTITY_TYPES.LEAD]: 'Lead',
};

const TYPE_ROUTES: Record<string, (id: number) => string> = {
  [ENTITY_TYPES.MERCADO]: (id) => `/mercado/${id}`,
  [ENTITY_TYPES.CLIENTE]: () => '/',
  [ENTITY_TYPES.CONCORRENTE]: () => '/',
  [ENTITY_TYPES.LEAD]: () => '/',
};

// ============================================================================
// TYPES
// ============================================================================

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchResult {
  id: number;
  type: string;
  title: string;
  subtitle?: string;
}

type GroupedResults = Record<string, SearchResult[]>;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getTypeIcon(type: string): LucideIcon {
  switch (type) {
    case ENTITY_TYPES.MERCADO:
      return Building2;
    case ENTITY_TYPES.CLIENTE:
      return Users;
    case ENTITY_TYPES.CONCORRENTE:
      return Target;
    case ENTITY_TYPES.LEAD:
      return TrendingUp;
    default:
      return Search;
  }
}

function getTypeLabel(type: string): string {
  return TYPE_LABELS[type] || type;
}

function getTypeRoute(type: string, id: number): string {
  const routeFn = TYPE_ROUTES[type];
  return routeFn ? routeFn(id) : '/';
}

function groupResultsByType(results: SearchResult[]): GroupedResults {
  return results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as GroupedResults);
}

// ============================================================================
// COMPONENT
// ============================================================================

function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const { selectedProjectId } = useSelectedProject();
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: results = [], isLoading } = trpc.search.global.useQuery(
    {
      query,
      projectId: selectedProjectId || undefined,
      limit: SEARCH_CONFIG.LIMIT,
    },
    { enabled: query.length >= SEARCH_CONFIG.MIN_QUERY_LENGTH }
  );

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const fuse = useMemo(
    () =>
      new Fuse(results, {
        keys: [...SEARCH_KEYS],
        threshold: SEARCH_CONFIG.FUZZY_THRESHOLD,
        includeScore: true,
      }),
    [results]
  );

  const filteredResults = useMemo(() => {
    if (query.length === 0) return [];
    if (query.length < SEARCH_CONFIG.FUZZY_MIN_LENGTH) return results;
    return fuse.search(query).map((r) => r.item);
  }, [query, results, fuse]);

  const groupedResults = useMemo(
    () => groupResultsByType(filteredResults),
    [filteredResults]
  );

  const hasResults = useMemo(
    () => filteredResults.length > 0,
    [filteredResults.length]
  );

  const showEmptyState = useMemo(() => query.length === 0, [query.length]);

  const showNoResults = useMemo(
    () => !isLoading && query.length > 0 && !hasResults,
    [isLoading, query.length, hasResults]
  );

  const showLoading = useMemo(
    () => isLoading && query.length > 0,
    [isLoading, query.length]
  );

  const resultsCountLabel = useMemo(
    () => `${filteredResults.length} resultados`,
    [filteredResults.length]
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSelect = useCallback(
    (result: SearchResult) => {
      onOpenChange(false);
      setQuery('');
      const route = getTypeRoute(result.type, result.id);
      router.push(route);
    },
    [onOpenChange, router]
  );

  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
    },
    []
  );

  const handleNavigateDown = useCallback(() => {
    setSelectedIndex((prev) => Math.min(prev + 1, filteredResults.length - 1));
  }, [filteredResults.length]);

  const handleNavigateUp = useCallback(() => {
    setSelectedIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleSelectCurrent = useCallback(() => {
    const currentResult = filteredResults[selectedIndex];
    if (currentResult) {
      handleSelect(currentResult);
    }
  }, [filteredResults, selectedIndex, handleSelect]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Reset selected index quando resultados mudam
  useEffect(() => {
    if (selectedIndex >= filteredResults.length) {
      setSelectedIndex(0);
    }
  }, [filteredResults.length, selectedIndex]);

  // Focus input quando abrir
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), SEARCH_CONFIG.FOCUS_DELAY);
    }
  }, [open]);

  // Navegação por teclado
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNavigateDown();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleNavigateUp();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSelectCurrent();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, handleNavigateDown, handleNavigateUp, handleSelectCurrent]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderIcon = useCallback((type: string) => {
    const Icon = getTypeIcon(type);
    return <Icon className="h-4 w-4" />;
  }, []);

  const renderEmptyState = useCallback(
    () => (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Search className="h-12 w-12 mb-2 opacity-50" />
        <p className="text-sm">{PLACEHOLDERS.EMPTY_STATE}</p>
        <p className="text-xs mt-1">{PLACEHOLDERS.EMPTY_SUBTITLE}</p>
      </div>
    ),
    []
  );

  const renderNoResults = useCallback(
    () => (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Search className="h-12 w-12 mb-2 opacity-50" />
        <p className="text-sm">{PLACEHOLDERS.NO_RESULTS}</p>
        <p className="text-xs mt-1">{PLACEHOLDERS.NO_RESULTS_HINT}</p>
      </div>
    ),
    []
  );

  const renderLoading = useCallback(
    () => (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    ),
    []
  );

  const renderResult = useCallback(
    (result: SearchResult, isSelected: boolean) => (
      <button
        key={`${result.type}-${result.id}`}
        onClick={() => handleSelect(result)}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
          isSelected
            ? 'bg-accent text-accent-foreground'
            : 'hover:bg-accent/50'
        }`}
      >
        <div className="flex-shrink-0 text-muted-foreground">
          {renderIcon(result.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{result.title}</div>
          {result.subtitle && (
            <div className="text-xs text-muted-foreground truncate">
              {result.subtitle}
            </div>
          )}
        </div>
      </button>
    ),
    [handleSelect, renderIcon]
  );

  const renderGroupedResults = useCallback(
    () =>
      Object.entries(groupedResults).map(([type, items]) => (
        <div key={type} className="mb-4">
          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {getTypeLabel(type)} ({items.length})
          </div>
          {items.map((result) => {
            const globalIndex = filteredResults.indexOf(result as any);
            const isSelected = globalIndex === selectedIndex;
            return renderResult(result, isSelected);
          })}
        </div>
      )),
    [groupedResults, filteredResults, selectedIndex, renderResult]
  );

  const renderFooter = useCallback(
    () => (
      <div className="border-t px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">
              {KEYBOARD_KEYS.UP}
            </kbd>
            {KEYBOARD_HINTS.NAVIGATE}
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">
              {KEYBOARD_KEYS.ENTER}
            </kbd>
            {KEYBOARD_HINTS.SELECT}
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">
              {KEYBOARD_KEYS.ESC}
            </kbd>
            {KEYBOARD_HINTS.CLOSE}
          </span>
        </div>
        <span>{resultsCountLabel}</span>
      </div>
    ),
    [resultsCountLabel]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        {/* Search Input */}
        <div className="flex items-center border-b px-4 py-3">
          <Search className="h-5 w-5 text-muted-foreground mr-3" />
          <Input
            ref={inputRef}
            placeholder={PLACEHOLDERS.INPUT}
            value={query}
            onChange={handleQueryChange}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
          />
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto p-2">
          {showLoading && renderLoading()}
          {showNoResults && renderNoResults()}
          {showEmptyState && renderEmptyState()}
          {hasResults && renderGroupedResults()}
        </div>

        {/* Footer */}
        {hasResults && renderFooter()}
      </DialogContent>
    </Dialog>
  );
}

export default GlobalSearch;
