'use client';

/**
 * UnifiedFilterPanel - Painel Unificado de Filtros
 * Filtros aplicados em todas as visualizações (Lista, Mapa, Kanban)
 */

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useFilters } from '@/contexts/FilterContext';
import { X, Filter, Search } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';

// ============================================================================
// CONSTANTS
// ============================================================================

const QUALITY_RANGE = {
  MIN: 0,
  MAX: 100,
  STEP: 5,
} as const;

const ENTITY_TYPES = {
  ALL: 'todos',
  CLIENTS: 'clientes',
  COMPETITORS: 'concorrentes',
  LEADS: 'leads',
} as const;

const ENTITY_TYPE_LABELS: Record<string, string> = {
  [ENTITY_TYPES.ALL]: 'Todos',
  [ENTITY_TYPES.CLIENTS]: 'Clientes',
  [ENTITY_TYPES.COMPETITORS]: 'Concorrentes',
  [ENTITY_TYPES.LEADS]: 'Leads',
};

const VALIDATION_STATUS = {
  PENDING: 'pendente',
  VALIDATED: 'validado',
  DISCARDED: 'descartado',
} as const;

const VALIDATION_STATUS_OPTIONS = [
  VALIDATION_STATUS.PENDING,
  VALIDATION_STATUS.VALIDATED,
  VALIDATION_STATUS.DISCARDED,
] as const;

const VALIDATION_STATUS_LABELS: Record<string, string> = {
  [VALIDATION_STATUS.PENDING]: 'Pendente',
  [VALIDATION_STATUS.VALIDATED]: 'Validado',
  [VALIDATION_STATUS.DISCARDED]: 'Descartado',
};

const LABELS = {
  QUALITY: 'Qualidade',
  QUALITY_MIN: 'Mínima',
  QUALITY_MAX: 'Máxima',
  ENTITY_TYPE: 'Tipo de Entidade',
  VALIDATION_STATUS: 'Status de Validação',
  STATES: 'Estados',
  TAGS: 'Tags',
  ADVANCED_FILTERS: 'Filtros Avançados',
  CLEAR_ALL_FILTERS: 'Limpar Todos os Filtros',
  ACTIVE_FILTERS: 'filtros ativos',
} as const;

const PLACEHOLDERS = {
  SEARCH: 'Buscar em todos os dados...',
} as const;

const DESCRIPTIONS = {
  ADVANCED_FILTERS:
    'Configure filtros que serão aplicados em todas as visualizações (Lista, Mapa, Kanban)',
} as const;

const SHEET_WIDTH = 400;

// ============================================================================
// TYPES
// ============================================================================

interface FilterOptions {
  estados: string[];
  tags: string[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateActiveFiltersCount(filters: {
  estados: string[];
  cidades: string[];
  tags: string[];
  statusValidacao: string[];
}): number {
  return (
    filters.estados.length +
    filters.cidades.length +
    filters.tags.length +
    filters.statusValidacao.length
  );
}

function getQualityRangeLabel(min: number, max: number): string {
  return `${LABELS.QUALITY} (${min} - ${max})`;
}

function getValidationStatusLabel(status: string): string {
  return VALIDATION_STATUS_LABELS[status] || status;
}

function toggleArrayItem<T>(array: T[], item: T): T[] {
  return array.includes(item)
    ? array.filter((i) => i !== item)
    : [...array, item];
}

// ============================================================================
// COMPONENT
// ============================================================================

export function UnifiedFilterPanel() {
  const { filters, updateFilters, clearFilters, hasActiveFilters } =
    useFilters();
  const [isOpen, setIsOpen] = useState(false);

  // Buscar opções de filtros do backend
  const { data: filterOptions } = trpc.mercados.getFilterOptions.useQuery();

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const activeFiltersCount = useMemo(
    () => calculateActiveFiltersCount(filters as any),
    [filters]
  );

  const activeFiltersLabel = useMemo(
    () => `${activeFiltersCount} ${LABELS.ACTIVE_FILTERS}`,
    [activeFiltersCount]
  );

  const qualityRangeLabel = useMemo(
    () => getQualityRangeLabel(filters.qualidadeMin, filters.qualidadeMax),
    [filters.qualidadeMin, filters.qualidadeMax]
  );

  const hasEstados = useMemo(
    () => filterOptions?.estados && filterOptions.estados.length > 0,
    [filterOptions?.estados]
  );

  const hasTags = useMemo(
    () => filterOptions?.tags && filterOptions.tags.length > 0,
    [filterOptions?.tags]
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleQualityChange = useCallback(
    (values: number[]) => {
      updateFilters({
        qualidadeMin: values[0],
        qualidadeMax: values[1],
      });
    },
    [updateFilters]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateFilters({ searchTerm: e.target.value });
    },
    [updateFilters]
  );

  const handleEntityTypeChange = useCallback(
    (value: string) => {
      updateFilters({ tipoEntidade: value });
    },
    [updateFilters]
  );

  const toggleEstado = useCallback(
    (estado: string) => {
      const newEstados = toggleArrayItem(filters.estados, estado);
      updateFilters({ estados: newEstados });
    },
    [filters.estados, updateFilters]
  );

  const toggleTag = useCallback(
    (tag: string) => {
      const newTags = toggleArrayItem(filters.tags, tag);
      updateFilters({ tags: newTags });
    },
    [filters.tags, updateFilters]
  );

  const toggleStatus = useCallback(
    (status: string) => {
      const newStatus = toggleArrayItem(filters.statusValidacao, status);
      updateFilters({ statusValidacao: newStatus });
    },
    [filters.statusValidacao, updateFilters]
  );

  const handleClearFiltersAndClose = useCallback(() => {
    clearFilters();
    setIsOpen(false);
  }, [clearFilters]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderSearchInput = useCallback(
    () => (
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={PLACEHOLDERS.SEARCH}
          value={filters.searchTerm}
          onChange={handleSearchChange}
          className="pl-9"
        />
      </div>
    ),
    [filters.searchTerm, handleSearchChange]
  );

  const renderActiveFiltersBadge = useCallback(
    () => (
      <Badge variant="secondary" className="gap-1">
        <Filter className="h-3 w-3" />
        {activeFiltersLabel}
      </Badge>
    ),
    [activeFiltersLabel]
  );

  const renderQualityFilter = useCallback(
    () => (
      <div className="space-y-3">
        <Label>{qualityRangeLabel}</Label>
        <Slider
          min={QUALITY_RANGE.MIN}
          max={QUALITY_RANGE.MAX}
          step={QUALITY_RANGE.STEP}
          value={[filters.qualidadeMin, filters.qualidadeMax]}
          onValueChange={handleQualityChange}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{LABELS.QUALITY_MIN}</span>
          <span>{LABELS.QUALITY_MAX}</span>
        </div>
      </div>
    ),
    [
      qualityRangeLabel,
      filters.qualidadeMin,
      filters.qualidadeMax,
      handleQualityChange,
    ]
  );

  const renderEntityTypeFilter = useCallback(
    () => (
      <div className="space-y-3">
        <Label>{LABELS.ENTITY_TYPE}</Label>
        <Select
          value={filters.tipoEntidade}
          onValueChange={handleEntityTypeChange}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ENTITY_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    ),
    [filters.tipoEntidade, handleEntityTypeChange]
  );

  const renderValidationStatusFilter = useCallback(
    () => (
      <div className="space-y-3">
        <Label>{LABELS.VALIDATION_STATUS}</Label>
        <div className="space-y-2">
          {VALIDATION_STATUS_OPTIONS.map((status) => (
            <div key={status} className="flex items-center space-x-2">
              <Checkbox
                id={`status-${status}`}
                checked={filters.statusValidacao.includes(status)}
                onCheckedChange={() => toggleStatus(status)}
              />
              <label
                htmlFor={`status-${status}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
              >
                {getValidationStatusLabel(status)}
              </label>
            </div>
          ))}
        </div>
      </div>
    ),
    [filters.statusValidacao, toggleStatus]
  );

  const renderEstadosFilter = useCallback(
    () => (
      <div className="space-y-3">
        <Label>{LABELS.STATES}</Label>
        <div className="flex flex-wrap gap-2">
          {filterOptions?.estados.map((estado: string) => (
            <Badge
              key={estado}
              variant={filters.estados.includes(estado) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleEstado(estado)}
            >
              {estado}
              {filters.estados.includes(estado) && (
                <X className="ml-1 h-3 w-3" />
              )}
            </Badge>
          ))}
        </div>
      </div>
    ),
    [filterOptions?.estados, filters.estados, toggleEstado]
  );

  const renderTagsFilter = useCallback(
    () => (
      <div className="space-y-3">
        <Label>{LABELS.TAGS}</Label>
        <div className="flex flex-wrap gap-2">
          {filterOptions?.tags.map((tag: string) => (
            <Badge
              key={tag}
              variant={filters.tags.includes(tag) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleTag(tag)}
            >
              {tag}
              {filters.tags.includes(tag) && <X className="ml-1 h-3 w-3" />}
            </Badge>
          ))}
        </div>
      </div>
    ),
    [filterOptions?.tags, filters.tags, toggleTag]
  );

  const renderClearFiltersButton = useCallback(
    () => (
      <Button
        variant="outline"
        className="w-full"
        onClick={handleClearFiltersAndClose}
      >
        <X className="h-4 w-4 mr-2" />
        {LABELS.CLEAR_ALL_FILTERS}
      </Button>
    ),
    [handleClearFiltersAndClose]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="flex items-center gap-2">
      {/* Busca rápida */}
      {renderSearchInput()}

      {/* Indicador de filtros ativos */}
      {hasActiveFilters && renderActiveFiltersBadge()}

      {/* Painel de filtros avançados */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            {LABELS.ADVANCED_FILTERS}
          </Button>
        </SheetTrigger>
        <SheetContent className={`w-[${SHEET_WIDTH}px] overflow-y-auto`}>
          <SheetHeader>
            <SheetTitle>{LABELS.ADVANCED_FILTERS}</SheetTitle>
            <SheetDescription>
              {DESCRIPTIONS.ADVANCED_FILTERS}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Filtro de Qualidade */}
            {renderQualityFilter()}

            {/* Filtro por Tipo de Entidade */}
            {renderEntityTypeFilter()}

            {/* Filtro por Status de Validação */}
            {renderValidationStatusFilter()}

            {/* Filtro por Estados */}
            {hasEstados && renderEstadosFilter()}

            {/* Filtro por Tags */}
            {hasTags && renderTagsFilter()}

            {/* Botão Limpar Filtros */}
            {hasActiveFilters && renderClearFiltersButton()}
          </div>
        </SheetContent>
      </Sheet>

      {/* Botão rápido para limpar filtros */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
