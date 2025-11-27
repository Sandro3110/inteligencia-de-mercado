'use client';

/**
 * NotificationFilters - Filtros de Notificações
 * Permite filtrar notificações por tipo, período, projeto, status e texto
 */

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
import { Card, CardContent } from '@/components/ui/card';
import { X, Search, Filter } from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';

// ============================================================================
// CONSTANTS
// ============================================================================

const NOTIFICATION_TYPES = [
  { value: 'all', label: 'Todos os Tipos' },
  { value: 'enrichment', label: 'Enriquecimento' },
  { value: 'validation', label: 'Validação' },
  { value: 'export', label: 'Exportação' },
  { value: 'lead_quality', label: 'Qualidade de Lead' },
  { value: 'lead_closed', label: 'Lead Fechado' },
  { value: 'new_competitor', label: 'Novo Concorrente' },
  { value: 'market_threshold', label: 'Limite de Mercado' },
  { value: 'data_incomplete', label: 'Dados Incompletos' },
] as const;

const PERIODS = [
  { value: 'all', label: 'Todos os Períodos' },
  { value: 'today', label: 'Hoje' },
  { value: '7days', label: 'Últimos 7 dias' },
  { value: '30days', label: 'Últimos 30 dias' },
  { value: '90days', label: 'Últimos 90 dias' },
] as const;

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: 'unread', label: 'Não Lidas' },
  { value: 'read', label: 'Lidas' },
] as const;

const ALL_VALUE = 'all';

const DEBOUNCE_DELAY = 300; // ms

const LABELS = {
  SEARCH_PLACEHOLDER: 'Buscar por título ou mensagem...',
  TYPE_LABEL: 'Tipo',
  TYPE_PLACEHOLDER: 'Selecione o tipo',
  PERIOD_LABEL: 'Período',
  PERIOD_PLACEHOLDER: 'Selecione o período',
  STATUS_LABEL: 'Status',
  STATUS_PLACEHOLDER: 'Selecione o status',
  PROJECT_LABEL: 'Projeto',
  PROJECT_PLACEHOLDER: 'Selecione o projeto',
  ALL_PROJECTS: 'Todos os Projetos',
  ACTIVE_FILTERS: 'Filtros ativos:',
  PROJECT_ID: (id: number) => `Projeto #${id}`,
} as const;

const GRID_CLASSES = {
  CONTAINER: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t',
} as const;

const DEFAULT_FILTERS = {
  type: ALL_VALUE,
  period: ALL_VALUE,
  status: ALL_VALUE as 'all' | 'read' | 'unread',
  projectId: undefined,
  searchText: '',
} as const;

// ============================================================================
// TYPES
// ============================================================================

export interface NotificationFiltersState {
  type?: string;
  period?: string;
  projectId?: number;
  status?: 'all' | 'read' | 'unread';
  searchText?: string;
}

interface NotificationFiltersProps {
  filters?: NotificationFiltersState;
  onFiltersChange?: (filters: NotificationFiltersState) => void;
  projects?: Array<{ id: number; nome: string }>;
}

interface FilterOption {
  value: string;
  label: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isFilterActive(value: string | number | undefined): boolean {
  return value !== undefined && value !== ALL_VALUE;
}

function hasActiveFilters(filters: NotificationFiltersState): boolean {
  return (
    isFilterActive(filters.type) ||
    isFilterActive(filters.period) ||
    filters.projectId !== undefined ||
    isFilterActive(filters.status) ||
    !!filters.searchText
  );
}

function findOptionLabel(
  options: readonly FilterOption[],
  value: string | undefined
): string | undefined {
  return options.find((opt) => opt.value === value)?.label;
}

function parseProjectIdOrUndefined(value: string): number | undefined {
  return value === ALL_VALUE ? undefined : parseInt(value, 10);
}

// ============================================================================
// COMPONENT
// ============================================================================

function NotificationFilters({
  filters = {},
  onFiltersChange = () => {},
  projects = [],
}: NotificationFiltersProps = {}) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [searchText, setSearchText] = useState(filters.searchText || '');
  const [isExpanded, setIsExpanded] = useState(false);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText !== filters.searchText) {
        onFiltersChange({ ...filters, searchText });
      }
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const hasFilters = useMemo(() => hasActiveFilters(filters), [filters]);

  const hasProjects = useMemo(() => projects.length > 0, [projects.length]);

  const typeLabel = useMemo(
    () => findOptionLabel(NOTIFICATION_TYPES, filters.type),
    [filters.type]
  );

  const periodLabel = useMemo(
    () => findOptionLabel(PERIODS, filters.period),
    [filters.period]
  );

  const statusLabel = useMemo(
    () => findOptionLabel(STATUS_OPTIONS, filters.status),
    [filters.status]
  );

  const expandButtonClasses = useMemo(
    () => (isExpanded ? 'bg-primary/10' : ''),
    [isExpanded]
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const clearFilters = useCallback(() => {
    setSearchText('');
    onFiltersChange({
      type: DEFAULT_FILTERS.type,
      period: DEFAULT_FILTERS.period,
      status: DEFAULT_FILTERS.status,
      projectId: DEFAULT_FILTERS.projectId,
      searchText: DEFAULT_FILTERS.searchText,
    });
  }, [onFiltersChange]);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchText(e.target.value);
    },
    []
  );

  const handleTypeChange = useCallback(
    (value: string) => {
      onFiltersChange({
        ...filters,
        type: value === ALL_VALUE ? undefined : value,
      });
    },
    [filters, onFiltersChange]
  );

  const handlePeriodChange = useCallback(
    (value: string) => {
      onFiltersChange({
        ...filters,
        period: value === ALL_VALUE ? undefined : value,
      });
    },
    [filters, onFiltersChange]
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      onFiltersChange({
        ...filters,
        status: value as 'all' | 'read' | 'unread',
      });
    },
    [filters, onFiltersChange]
  );

  const handleProjectChange = useCallback(
    (value: string) => {
      onFiltersChange({
        ...filters,
        projectId: parseProjectIdOrUndefined(value),
      });
    },
    [filters, onFiltersChange]
  );

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderTypeOption = useCallback(
    (option: (typeof NOTIFICATION_TYPES)[number]) => (
      <SelectItem key={option.value} value={option.value}>
        {option.label}
      </SelectItem>
    ),
    []
  );

  const renderPeriodOption = useCallback(
    (option: (typeof PERIODS)[number]) => (
      <SelectItem key={option.value} value={option.value}>
        {option.label}
      </SelectItem>
    ),
    []
  );

  const renderStatusOption = useCallback(
    (option: (typeof STATUS_OPTIONS)[number]) => (
      <SelectItem key={option.value} value={option.value}>
        {option.label}
      </SelectItem>
    ),
    []
  );

  const renderProjectOption = useCallback(
    (project: { id: number; nome: string }) => (
      <SelectItem key={project.id} value={project.id.toString()}>
        {project.nome}
      </SelectItem>
    ),
    []
  );

  const renderFilterBadge = useCallback((label: string) => (
    <span className="px-2 py-1 bg-primary/10 rounded">{label}</span>
  ), []);

  const renderActiveFiltersSummary = useCallback(() => {
    if (!hasFilters) return null;

    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium">{LABELS.ACTIVE_FILTERS}</span>
        {typeLabel && renderFilterBadge(typeLabel)}
        {periodLabel && renderFilterBadge(periodLabel)}
        {statusLabel && renderFilterBadge(statusLabel)}
        {filters.projectId &&
          renderFilterBadge(LABELS.PROJECT_ID(filters.projectId))}
      </div>
    );
  }, [hasFilters, typeLabel, periodLabel, statusLabel, filters.projectId, renderFilterBadge]);

  const renderAdvancedFilters = useCallback(
    () => (
      <div className={GRID_CLASSES.CONTAINER}>
        {/* Type Filter */}
        <div className="space-y-2">
          <Label htmlFor="type-filter">{LABELS.TYPE_LABEL}</Label>
          <Select
            value={filters.type || ALL_VALUE}
            onValueChange={handleTypeChange}
          >
            <SelectTrigger id="type-filter">
              <SelectValue placeholder={LABELS.TYPE_PLACEHOLDER} />
            </SelectTrigger>
            <SelectContent>
              {NOTIFICATION_TYPES.map(renderTypeOption)}
            </SelectContent>
          </Select>
        </div>

        {/* Period Filter */}
        <div className="space-y-2">
          <Label htmlFor="period-filter">{LABELS.PERIOD_LABEL}</Label>
          <Select
            value={filters.period || ALL_VALUE}
            onValueChange={handlePeriodChange}
          >
            <SelectTrigger id="period-filter">
              <SelectValue placeholder={LABELS.PERIOD_PLACEHOLDER} />
            </SelectTrigger>
            <SelectContent>{PERIODS.map(renderPeriodOption)}</SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status-filter">{LABELS.STATUS_LABEL}</Label>
          <Select
            value={filters.status || ALL_VALUE}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger id="status-filter">
              <SelectValue placeholder={LABELS.STATUS_PLACEHOLDER} />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(renderStatusOption)}
            </SelectContent>
          </Select>
        </div>

        {/* Project Filter */}
        {hasProjects && (
          <div className="space-y-2">
            <Label htmlFor="project-filter">{LABELS.PROJECT_LABEL}</Label>
            <Select
              value={filters.projectId?.toString() || ALL_VALUE}
              onValueChange={handleProjectChange}
            >
              <SelectTrigger id="project-filter">
                <SelectValue placeholder={LABELS.PROJECT_PLACEHOLDER} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>
                  {LABELS.ALL_PROJECTS}
                </SelectItem>
                {projects.map(renderProjectOption)}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    ),
    [
      filters.type,
      filters.period,
      filters.status,
      filters.projectId,
      hasProjects,
      projects,
      handleTypeChange,
      handlePeriodChange,
      handleStatusChange,
      handleProjectChange,
      renderTypeOption,
      renderPeriodOption,
      renderStatusOption,
      renderProjectOption,
    ]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={LABELS.SEARCH_PLACEHOLDER}
                value={searchText}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleExpanded}
              className={expandButtonClasses}
            >
              <Filter className="h-4 w-4" />
            </Button>
            {hasFilters && (
              <Button variant="ghost" size="icon" onClick={clearFilters}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Advanced Filters (Collapsible) */}
          {isExpanded && renderAdvancedFilters()}

          {/* Active Filters Summary */}
          {renderActiveFiltersSummary()}
        </div>
      </CardContent>
    </Card>
  );
}

export default NotificationFilters;
