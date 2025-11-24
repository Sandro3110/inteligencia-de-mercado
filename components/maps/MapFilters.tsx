/**
 * MapFilters Component
 * Advanced filters for unified map
 * Search, quality, markets, regions, period
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter, X } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';

// ============================================================================
// TYPES
// ============================================================================

export interface MapFiltersState {
  searchText: string;
  minQuality: number;
  selectedMercados: number[];
  selectedUFs: string[];
  dateFrom?: Date;
  dateTo?: Date;
}

export interface MapFiltersProps {
  projectId: number;
  pesquisaId?: number;
  filters: MapFiltersState;
  onChange: (filters: MapFiltersState) => void;
}

interface Mercado {
  id: number;
  nome: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const UFS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;

const QUALITY_SLIDER_CONFIG = {
  MIN: 0,
  MAX: 100,
  STEP: 5,
} as const;

const ICON_SIZES = {
  SMALL: 'w-4 h-4',
} as const;

const LABELS = {
  TITLE: 'Filtros',
  SEARCH: 'Buscar',
  SEARCH_PLACEHOLDER: 'Nome, cidade...',
  MIN_QUALITY: 'Qualidade Mínima',
  QUALITY_UNIT: '%',
  TOGGLE_ADVANCED: (show: boolean) => `${show ? 'Ocultar' : 'Mostrar'} Filtros Avançados`,
  MERCADOS: 'Mercados',
  ESTADOS: 'Estados (UF)',
  CLEAR_FILTERS: 'Limpar Filtros',
  ACTIVE_FILTERS: (count: number) => `${count} ativo${count > 1 ? 's' : ''}`,
} as const;

const CLASSES = {
  CARD: 'w-full',
  HEADER: 'pb-3',
  HEADER_ROW: 'flex items-center justify-between',
  TITLE: 'text-sm font-medium flex items-center gap-2',
  BADGE: 'text-xs',
  CONTENT: 'space-y-4',
  SECTION: 'space-y-2',
  SEARCH_CONTAINER: 'relative',
  SEARCH_ICON: 'absolute left-2 top-2.5 h-4 w-4 text-muted-foreground',
  SEARCH_INPUT: 'pl-8',
  CLEAR_BUTTON: 'absolute right-2 top-2.5 text-muted-foreground hover:text-foreground',
  SLIDER_ROW: 'flex items-center justify-between',
  SLIDER_VALUE: 'text-xs text-muted-foreground',
  SLIDER: 'w-full',
  TOGGLE_BUTTON: 'w-full',
  SCROLLABLE_LIST: 'max-h-40 overflow-y-auto space-y-2 border rounded-md p-2',
  UF_GRID: 'max-h-40 overflow-y-auto grid grid-cols-3 gap-2 border rounded-md p-2',
  CHECKBOX_ROW: 'flex items-center space-x-2',
  CHECKBOX_LABEL: 'text-xs cursor-pointer',
  CHECKBOX_LABEL_FLEX: 'text-xs cursor-pointer flex-1',
} as const;

const DEFAULT_FILTERS: MapFiltersState = {
  searchText: '',
  minQuality: 0,
  selectedMercados: [],
  selectedUFs: [],
  dateFrom: undefined,
  dateTo: undefined,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate number of active filters
 */
function calculateActiveFiltersCount(filters: MapFiltersState): number {
  return (
    (filters.searchText ? 1 : 0) +
    (filters.minQuality > 0 ? 1 : 0) +
    (filters.selectedMercados.length > 0 ? 1 : 0) +
    (filters.selectedUFs.length > 0 ? 1 : 0) +
    (filters.dateFrom || filters.dateTo ? 1 : 0)
  );
}

/**
 * Toggle item in array
 */
function toggleArrayItem<T>(array: T[], item: T): T[] {
  return array.includes(item) ? array.filter((i) => i !== item) : [...array, item];
}

/**
 * Format quality value
 */
function formatQuality(value: number): string {
  return `${value}${LABELS.QUALITY_UNIT}`;
}

/**
 * Get mercado checkbox ID
 */
function getMercadoCheckboxId(mercadoId: number): string {
  return `mercado-${mercadoId}`;
}

/**
 * Get UF checkbox ID
 */
function getUFCheckboxId(uf: string): string {
  return `uf-${uf}`;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Mercado checkbox item
 */
interface MercadoItemProps {
  mercado: Mercado;
  checked: boolean;
  onToggle: (id: number) => void;
}

function MercadoItem({ mercado, checked, onToggle }: MercadoItemProps) {
  const checkboxId = useMemo(() => getMercadoCheckboxId(mercado.id), [mercado.id]);

  const handleChange = useCallback(() => {
    onToggle(mercado.id);
  }, [onToggle, mercado.id]);

  return (
    <div className={CLASSES.CHECKBOX_ROW}>
      <Checkbox id={checkboxId} checked={checked} onCheckedChange={handleChange} />
      <label htmlFor={checkboxId} className={CLASSES.CHECKBOX_LABEL_FLEX}>
        {mercado.nome}
      </label>
    </div>
  );
}

/**
 * UF checkbox item
 */
interface UFItemProps {
  uf: string;
  checked: boolean;
  onToggle: (uf: string) => void;
}

function UFItem({ uf, checked, onToggle }: UFItemProps) {
  const checkboxId = useMemo(() => getUFCheckboxId(uf), [uf]);

  const handleChange = useCallback(() => {
    onToggle(uf);
  }, [onToggle, uf]);

  return (
    <div className={CLASSES.CHECKBOX_ROW}>
      <Checkbox id={checkboxId} checked={checked} onCheckedChange={handleChange} />
      <label htmlFor={checkboxId} className={CLASSES.CHECKBOX_LABEL}>
        {uf}
      </label>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Advanced map filters component
 */
export default function MapFilters({ projectId, pesquisaId, filters, onChange }: MapFiltersProps) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [showAdvanced, setShowAdvanced] = useState(false);

  // ============================================================================
  // QUERIES
  // ============================================================================

  const { data: mercados } = trpc.mercados.list.useQuery({
    projectId,
    pesquisaId,
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSearchChange = useCallback(
    (text: string) => {
      onChange({ ...filters, searchText: text });
    },
    [filters, onChange]
  );

  const handleQualityChange = useCallback(
    (value: number[]) => {
      onChange({ ...filters, minQuality: value[0] });
    },
    [filters, onChange]
  );

  const handleMercadoToggle = useCallback(
    (mercadoId: number) => {
      const selected = toggleArrayItem(filters.selectedMercados, mercadoId);
      onChange({ ...filters, selectedMercados: selected });
    },
    [filters, onChange]
  );

  const handleUFToggle = useCallback(
    (uf: string) => {
      const selected = toggleArrayItem(filters.selectedUFs, uf);
      onChange({ ...filters, selectedUFs: selected });
    },
    [filters, onChange]
  );

  const handleClearFilters = useCallback(() => {
    onChange(DEFAULT_FILTERS);
  }, [onChange]);

  const toggleAdvanced = useCallback(() => {
    setShowAdvanced((prev) => !prev);
  }, []);

  const handleSearchInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleSearchChange(e.target.value);
    },
    [handleSearchChange]
  );

  const handleClearSearch = useCallback(() => {
    handleSearchChange('');
  }, [handleSearchChange]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const activeFiltersCount = useMemo(() => calculateActiveFiltersCount(filters), [filters]);

  const hasActiveFilters = useMemo(() => activeFiltersCount > 0, [activeFiltersCount]);

  const hasSearchText = useMemo(() => Boolean(filters.searchText), [filters.searchText]);

  const hasMercados = useMemo(() => Boolean(mercados && mercados.length > 0), [mercados]);

  const toggleButtonLabel = useMemo(() => LABELS.TOGGLE_ADVANCED(showAdvanced), [showAdvanced]);

  const activeFiltersLabel = useMemo(
    () => LABELS.ACTIVE_FILTERS(activeFiltersCount),
    [activeFiltersCount]
  );

  const qualityValueLabel = useMemo(() => formatQuality(filters.minQuality), [filters.minQuality]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Card className={CLASSES.CARD}>
      <CardHeader className={CLASSES.HEADER}>
        <div className={CLASSES.HEADER_ROW}>
          <CardTitle className={CLASSES.TITLE}>
            <Filter className={ICON_SIZES.SMALL} />
            {LABELS.TITLE}
          </CardTitle>
          {hasActiveFilters && (
            <Badge variant="secondary" className={CLASSES.BADGE}>
              {activeFiltersLabel}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className={CLASSES.CONTENT}>
        {/* Text search */}
        <div className={CLASSES.SECTION}>
          <Label className={CLASSES.CHECKBOX_LABEL}>{LABELS.SEARCH}</Label>
          <div className={CLASSES.SEARCH_CONTAINER}>
            <Search className={CLASSES.SEARCH_ICON} />
            <Input
              placeholder={LABELS.SEARCH_PLACEHOLDER}
              value={filters.searchText}
              onChange={handleSearchInputChange}
              className={CLASSES.SEARCH_INPUT}
            />
            {hasSearchText && (
              <button onClick={handleClearSearch} className={CLASSES.CLEAR_BUTTON}>
                <X className={ICON_SIZES.SMALL} />
              </button>
            )}
          </div>
        </div>

        {/* Minimum quality */}
        <div className={CLASSES.SECTION}>
          <div className={CLASSES.SLIDER_ROW}>
            <Label className={CLASSES.CHECKBOX_LABEL}>{LABELS.MIN_QUALITY}</Label>
            <span className={CLASSES.SLIDER_VALUE}>{qualityValueLabel}</span>
          </div>
          <Slider
            value={[filters.minQuality]}
            onValueChange={handleQualityChange}
            min={QUALITY_SLIDER_CONFIG.MIN}
            max={QUALITY_SLIDER_CONFIG.MAX}
            step={QUALITY_SLIDER_CONFIG.STEP}
            className={CLASSES.SLIDER}
          />
        </div>

        {/* Toggle advanced filters button */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleAdvanced}
          className={CLASSES.TOGGLE_BUTTON}
        >
          {toggleButtonLabel}
        </Button>

        {/* Advanced filters */}
        {showAdvanced && (
          <>
            {/* Mercados */}
            {hasMercados && (
              <div className={CLASSES.SECTION}>
                <Label className={CLASSES.CHECKBOX_LABEL}>{LABELS.MERCADOS}</Label>
                <div className={CLASSES.SCROLLABLE_LIST}>
                  {mercados!.map((mercado) => (
                    <MercadoItem
                      key={mercado.id}
                      mercado={mercado}
                      checked={filters.selectedMercados.includes(mercado.id)}
                      onToggle={handleMercadoToggle}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* UFs */}
            <div className={CLASSES.SECTION}>
              <Label className={CLASSES.CHECKBOX_LABEL}>{LABELS.ESTADOS}</Label>
              <div className={CLASSES.UF_GRID}>
                {UFS_BRASIL.map((uf) => (
                  <UFItem
                    key={uf}
                    uf={uf}
                    checked={filters.selectedUFs.includes(uf)}
                    onToggle={handleUFToggle}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Clear filters button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className={CLASSES.TOGGLE_BUTTON}
          >
            <X className={`${ICON_SIZES.SMALL} mr-2`} />
            {LABELS.CLEAR_FILTERS}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
