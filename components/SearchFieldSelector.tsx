'use client';

import { useState, useCallback, useMemo } from 'react';
import { Settings, X } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';

// ============================================================================
// CONSTANTS
// ============================================================================

const FIELD_OPTIONS: SearchFieldOption[] = [
  {
    value: 'nome',
    label: 'Nome/Empresa',
    description: 'Buscar em nome de mercados, clientes, concorrentes e leads',
  },
  {
    value: 'cnpj',
    label: 'CNPJ',
    description: 'Buscar em CNPJ de todas as entidades',
  },
  {
    value: 'produto',
    label: 'Produto/Categoria',
    description: 'Buscar em produtos e categorias',
  },
  {
    value: 'cidade',
    label: 'Cidade',
    description: 'Buscar em cidade de clientes',
  },
  {
    value: 'uf',
    label: 'Estado (UF)',
    description: 'Buscar em UF de clientes',
  },
  {
    value: 'email',
    label: 'Email',
    description: 'Buscar em emails de contato',
  },
  {
    value: 'telefone',
    label: 'Telefone',
    description: 'Buscar em telefones de contato',
  },
  {
    value: 'observacoes',
    label: 'Observações',
    description: 'Buscar em observações e notas',
  },
];

const LABELS = {
  TITLE: 'Buscar em campos',
  DESCRIPTION: 'Selecione onde procurar a expressão',
  SELECT_ALL: 'Todos',
  CLEAR_ALL: 'Limpar',
  SELECTED_COUNT: (count: number) => `Campos selecionados (${count}):`,
  WARNING: '⚠️ Nenhum campo selecionado. A busca não retornará resultados.',
  BUTTON_TITLE: 'Configurar campos de busca',
} as const;

const ICON_SIZES = {
  MEDIUM: 'w-4 h-4',
  SMALL: 'w-2.5 h-2.5',
} as const;

const DIMENSIONS = {
  BUTTON: 'h-8 w-8',
  BADGE: 'h-4 w-4',
  ACTION_BUTTON: 'h-7',
  POPOVER_WIDTH: 'w-[360px]',
  MAX_HEIGHT: 'max-h-[320px]',
} as const;

const CSS_CLASSES = {
  BADGE_POSITION: 'absolute -top-1 -right-1',
  BADGE_TEXT: 'text-[9px]',
  OPTION_TEXT: 'text-[10px]',
  ACTION_BUTTON: 'px-2 text-xs',
} as const;

// ============================================================================
// TYPES
// ============================================================================

export type SearchField =
  | 'nome'
  | 'cnpj'
  | 'produto'
  | 'cidade'
  | 'uf'
  | 'email'
  | 'telefone'
  | 'observacoes';

interface SearchFieldOption {
  value: SearchField;
  label: string;
  description: string;
}

interface SearchFieldSelectorProps {
  selectedFields: SearchField[];
  onFieldsChange: (fields: SearchField[]) => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getAllFieldValues(): SearchField[] {
  return FIELD_OPTIONS.map((opt) => opt.value);
}

function findFieldOption(field: SearchField): SearchFieldOption | undefined {
  return FIELD_OPTIONS.find((opt) => opt.value === field);
}

function toggleArrayItem<T>(array: T[], item: T): T[] {
  return array.includes(item)
    ? array.filter((i) => i !== item)
    : [...array, item];
}

// ============================================================================
// COMPONENT
// ============================================================================

export function SearchFieldSelector({
  selectedFields,
  onFieldsChange,
}: SearchFieldSelectorProps) {
  // State
  const [isOpen, setIsOpen] = useState(false);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleToggleField = useCallback(
    (field: SearchField) => {
      onFieldsChange(toggleArrayItem(selectedFields, field));
    },
    [selectedFields, onFieldsChange]
  );

  const handleSelectAll = useCallback(() => {
    onFieldsChange(getAllFieldValues());
  }, [onFieldsChange]);

  const handleClearAll = useCallback(() => {
    onFieldsChange([]);
  }, [onFieldsChange]);

  const handleRemoveField = useCallback(
    (e: React.MouseEvent, field: SearchField) => {
      e.stopPropagation();
      handleToggleField(field);
    },
    [handleToggleField]
  );

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const selectedCount = useMemo(
    () => selectedFields.length,
    [selectedFields.length]
  );

  const hasSelection = useMemo(() => selectedCount > 0, [selectedCount]);

  const selectedCountLabel = useMemo(
    () => LABELS.SELECTED_COUNT(selectedCount),
    [selectedCount]
  );

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderBadge = useCallback(
    () =>
      hasSelection ? (
        <Badge
          variant="destructive"
          className={`${CSS_CLASSES.BADGE_POSITION} ${DIMENSIONS.BADGE} p-0 flex items-center justify-center ${CSS_CLASSES.BADGE_TEXT}`}
        >
          {selectedCount}
        </Badge>
      ) : null,
    [hasSelection, selectedCount]
  );

  const renderHeader = useCallback(
    () => (
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold">{LABELS.TITLE}</h4>
          <p className="text-xs text-muted-foreground">{LABELS.DESCRIPTION}</p>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className={`${DIMENSIONS.ACTION_BUTTON} ${CSS_CLASSES.ACTION_BUTTON}`}
          >
            {LABELS.SELECT_ALL}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className={`${DIMENSIONS.ACTION_BUTTON} ${CSS_CLASSES.ACTION_BUTTON}`}
          >
            {LABELS.CLEAR_ALL}
          </Button>
        </div>
      </div>
    ),
    [handleSelectAll, handleClearAll]
  );

  const renderOption = useCallback(
    (option: SearchFieldOption) => {
      const isSelected = selectedFields.includes(option.value);
      return (
        <div
          key={option.value}
          className="flex items-start gap-3 p-2 rounded hover:bg-accent/50 cursor-pointer"
          onClick={() => handleToggleField(option.value)}
        >
          <Checkbox checked={isSelected} className="mt-0.5" />
          <div className="flex-1">
            <label className="text-sm font-medium cursor-pointer">
              {option.label}
            </label>
            <p className="text-xs text-muted-foreground">{option.description}</p>
          </div>
        </div>
      );
    },
    [selectedFields, handleToggleField]
  );

  const renderOptionsList = useCallback(
    () => (
      <div className={`space-y-2 ${DIMENSIONS.MAX_HEIGHT} overflow-y-auto`}>
        {FIELD_OPTIONS.map(renderOption)}
      </div>
    ),
    [renderOption]
  );

  const renderWarning = useCallback(
    () =>
      !hasSelection ? (
        <div className="text-xs text-muted-foreground text-center py-2 bg-muted/30 rounded">
          {LABELS.WARNING}
        </div>
      ) : null,
    [hasSelection]
  );

  const renderSelectedBadge = useCallback(
    (field: SearchField) => {
      const option = findFieldOption(field);
      return (
        <Badge
          key={field}
          variant="secondary"
          className={`${CSS_CLASSES.OPTION_TEXT} px-2 py-0.5`}
        >
          {option?.label}
          <button
            onClick={(e) => handleRemoveField(e, field)}
            className="ml-1 hover:text-destructive"
          >
            <X className={ICON_SIZES.SMALL} />
          </button>
        </Badge>
      );
    },
    [handleRemoveField]
  );

  const renderSelectedFields = useCallback(
    () =>
      hasSelection ? (
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-2">
            {selectedCountLabel}
          </p>
          <div className="flex flex-wrap gap-1">
            {selectedFields.map(renderSelectedBadge)}
          </div>
        </div>
      ) : null,
    [hasSelection, selectedCountLabel, selectedFields, renderSelectedBadge]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`${DIMENSIONS.BUTTON} p-0`}
          title={LABELS.BUTTON_TITLE}
        >
          <Settings className={ICON_SIZES.MEDIUM} />
          {renderBadge()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={`${DIMENSIONS.POPOVER_WIDTH} p-4`} align="start">
        <div className="space-y-4">
          {renderHeader()}
          {renderOptionsList()}
          {renderWarning()}
          {renderSelectedFields()}
        </div>
      </PopoverContent>
    </Popover>
  );
}
