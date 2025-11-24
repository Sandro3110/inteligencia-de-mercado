'use client';

import { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Download, FileDown, Filter } from 'lucide-react';
import { Card } from './ui/card';

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_FILTERS = {
  dateFrom: '',
  dateTo: '',
  status: 'all',
  durationMin: '',
  durationMax: '',
} as const;

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'running', label: 'Em Execução' },
  { value: 'paused', label: 'Pausado' },
  { value: 'completed', label: 'Concluído' },
  { value: 'error', label: 'Erro' },
] as const;

const LABELS = {
  TITLE: 'Filtros',
  DATE_FROM: 'Data Inicial',
  DATE_TO: 'Data Final',
  STATUS: 'Status',
  DURATION_MIN: 'Duração Mínima (min)',
  DURATION_MAX: 'Duração Máxima (min)',
  CLEAR_FILTERS: 'Limpar Filtros',
  EXPORT_CSV: 'Exportar CSV',
  EXPORT_PDF: 'Exportar PDF',
} as const;

const PLACEHOLDERS = {
  STATUS: 'Todos',
  DURATION_MIN: '0',
  DURATION_MAX: '999',
} as const;

const ICON_SIZES = {
  SMALL: 'w-4 h-4',
  MEDIUM: 'w-5 h-5',
} as const;

const COLORS = {
  FILTER_ICON: 'text-blue-400',
} as const;

const GRID_CLASSES = {
  MAIN: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
} as const;

// ============================================================================
// TYPES
// ============================================================================

export interface FilterState {
  dateFrom: string;
  dateTo: string;
  status: string;
  durationMin: string;
  durationMax: string;
}

interface HistoryFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getDefaultFilters(): FilterState {
  return { ...DEFAULT_FILTERS };
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function FilterHeader() {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Filter className={`${ICON_SIZES.MEDIUM} ${COLORS.FILTER_ICON}`} />
      <h3 className="text-lg font-semibold">{LABELS.TITLE}</h3>
    </div>
  );
}

function DateFilter({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="date"
        value={value}
        onChange={handleChange}
        className="w-full"
      />
    </div>
  );
}

function StatusFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="status">{LABELS.STATUS}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="status">
          <SelectValue placeholder={PLACEHOLDERS.STATUS} />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function DurationFilter({
  id,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className="w-full"
      />
    </div>
  );
}

function ActionButtons({
  onReset,
  onExportCSV,
  onExportPDF,
}: {
  onReset: () => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-700">
      <Button variant="outline" size="sm" onClick={onReset}>
        {LABELS.CLEAR_FILTERS}
      </Button>

      <div className="flex-1" />

      <Button variant="outline" size="sm" onClick={onExportCSV} className="gap-2">
        <FileDown className={ICON_SIZES.SMALL} />
        {LABELS.EXPORT_CSV}
      </Button>

      <Button variant="outline" size="sm" onClick={onExportPDF} className="gap-2">
        <Download className={ICON_SIZES.SMALL} />
        {LABELS.EXPORT_PDF}
      </Button>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function HistoryFilters({
  onFilterChange,
  onExportCSV,
  onExportPDF,
}: HistoryFiltersProps) {
  // State
  const [filters, setFilters] = useState<FilterState>(getDefaultFilters());

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleFilterChange = useCallback(
    (key: keyof FilterState, value: string) => {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);
      onFilterChange(newFilters);
    },
    [filters, onFilterChange]
  );

  const handleReset = useCallback(() => {
    const resetFilters = getDefaultFilters();
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  }, [onFilterChange]);

  const handleDateFromChange = useCallback(
    (value: string) => handleFilterChange('dateFrom', value),
    [handleFilterChange]
  );

  const handleDateToChange = useCallback(
    (value: string) => handleFilterChange('dateTo', value),
    [handleFilterChange]
  );

  const handleStatusChange = useCallback(
    (value: string) => handleFilterChange('status', value),
    [handleFilterChange]
  );

  const handleDurationMinChange = useCallback(
    (value: string) => handleFilterChange('durationMin', value),
    [handleFilterChange]
  );

  const handleDurationMaxChange = useCallback(
    (value: string) => handleFilterChange('durationMax', value),
    [handleFilterChange]
  );

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderFilters = useCallback(
    () => (
      <div className={GRID_CLASSES.MAIN}>
        <DateFilter
          id="dateFrom"
          label={LABELS.DATE_FROM}
          value={filters.dateFrom}
          onChange={handleDateFromChange}
        />

        <DateFilter
          id="dateTo"
          label={LABELS.DATE_TO}
          value={filters.dateTo}
          onChange={handleDateToChange}
        />

        <StatusFilter value={filters.status} onChange={handleStatusChange} />

        <DurationFilter
          id="durationMin"
          label={LABELS.DURATION_MIN}
          placeholder={PLACEHOLDERS.DURATION_MIN}
          value={filters.durationMin}
          onChange={handleDurationMinChange}
        />

        <DurationFilter
          id="durationMax"
          label={LABELS.DURATION_MAX}
          placeholder={PLACEHOLDERS.DURATION_MAX}
          value={filters.durationMax}
          onChange={handleDurationMaxChange}
        />
      </div>
    ),
    [
      filters,
      handleDateFromChange,
      handleDateToChange,
      handleStatusChange,
      handleDurationMinChange,
      handleDurationMaxChange,
    ]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Card className="p-4 space-y-4">
      <FilterHeader />
      {renderFilters()}
      <ActionButtons
        onReset={handleReset}
        onExportCSV={onExportCSV}
        onExportPDF={onExportPDF}
      />
    </Card>
  );
}
