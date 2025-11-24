'use client';

import { useState, useCallback, useMemo } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';

// ============================================================================
// CONSTANTS
// ============================================================================

const LABELS = {
  CLEAR: 'Limpar',
  NO_OPTIONS: 'Nenhuma opção disponível',
} as const;

const ICON_SIZES = {
  SMALL: 'w-3 h-3',
  TINY: 'w-2.5 h-2.5',
} as const;

const CLASSES = {
  CONTAINER: 'space-y-2',
  TRIGGER_BUTTON: 'w-full justify-between gap-2',
  TRIGGER_CONTENT: 'flex items-center gap-2',
  TRIGGER_ACTIONS: 'flex items-center gap-1',
  TITLE_TEXT: 'text-xs',
  BADGE_COUNT: 'px-1.5 py-0 text-[10px]',
  POPOVER_CONTENT: 'w-[280px] p-3',
  POPOVER_INNER: 'space-y-3',
  HEADER: 'flex items-center justify-between',
  HEADER_TITLE: 'text-sm font-medium',
  CLEAR_BUTTON: 'h-6 px-2 text-xs',
  OPTIONS_CONTAINER: 'space-y-2 max-h-[300px] overflow-y-auto',
  NO_OPTIONS_TEXT: 'text-xs text-muted-foreground text-center py-4',
  OPTION_ITEM: 'flex items-center gap-2 p-2 rounded hover:bg-accent/50 cursor-pointer',
  OPTION_LABEL: 'text-sm flex-1 cursor-pointer',
  OPTION_COUNT: 'text-xs text-muted-foreground',
  SELECTED_PREVIEW: 'flex flex-wrap gap-1',
  SELECTED_BADGE: 'text-[10px] px-2 py-0.5',
  REMOVE_BUTTON: 'ml-1 hover:text-destructive',
} as const;

const POPOVER_CONFIG = {
  ALIGN: 'start' as const,
  MAX_HEIGHT: 300,
} as const;

// ============================================================================
// TYPES
// ============================================================================

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface MultiSelectFilterProps {
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onValuesChange: (values: string[]) => void;
  icon?: React.ReactNode;
}

interface OptionItemProps {
  option: FilterOption;
  isSelected: boolean;
  onToggle: (value: string) => void;
}

interface SelectedBadgeProps {
  label: string;
  value: string;
  onRemove: (value: string) => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getSelectedLabels(
  options: FilterOption[],
  selectedValues: string[]
): string[] {
  return options
    .filter((opt) => selectedValues.includes(opt.value))
    .map((opt) => opt.label);
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function OptionItem({ option, isSelected, onToggle }: OptionItemProps) {
  const handleClick = useCallback(() => {
    onToggle(option.value);
  }, [option.value, onToggle]);

  return (
    <div className={CLASSES.OPTION_ITEM} onClick={handleClick}>
      <Checkbox checked={isSelected} />
      <label className={CLASSES.OPTION_LABEL}>{option.label}</label>
      {option.count !== undefined && (
        <span className={CLASSES.OPTION_COUNT}>({option.count})</span>
      )}
    </div>
  );
}

function SelectedBadge({ label, value, onRemove }: SelectedBadgeProps) {
  const handleRemove = useCallback(() => {
    onRemove(value);
  }, [value, onRemove]);

  return (
    <Badge variant="secondary" className={CLASSES.SELECTED_BADGE}>
      {label}
      <button onClick={handleRemove} className={CLASSES.REMOVE_BUTTON}>
        <X className={ICON_SIZES.TINY} />
      </button>
    </Badge>
  );
}

function TriggerButton({
  title,
  icon,
  selectedCount,
}: {
  title: string;
  icon?: React.ReactNode;
  selectedCount: number;
}) {
  return (
    <Button variant="outline" size="sm" className={CLASSES.TRIGGER_BUTTON}>
      <div className={CLASSES.TRIGGER_CONTENT}>
        {icon}
        <span className={CLASSES.TITLE_TEXT}>{title}</span>
      </div>
      <div className={CLASSES.TRIGGER_ACTIONS}>
        {selectedCount > 0 && (
          <Badge variant="secondary" className={CLASSES.BADGE_COUNT}>
            {selectedCount}
          </Badge>
        )}
        <ChevronDown className={ICON_SIZES.SMALL} />
      </div>
    </Button>
  );
}

function PopoverHeader({
  title,
  hasSelection,
  onClear,
}: {
  title: string;
  hasSelection: boolean;
  onClear: () => void;
}) {
  return (
    <div className={CLASSES.HEADER}>
      <label className={CLASSES.HEADER_TITLE}>{title}</label>
      {hasSelection && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className={CLASSES.CLEAR_BUTTON}
        >
          {LABELS.CLEAR}
        </Button>
      )}
    </div>
  );
}

function OptionsList({
  options,
  selectedValues,
  onToggle,
}: {
  options: FilterOption[];
  selectedValues: string[];
  onToggle: (value: string) => void;
}) {
  if (options.length === 0) {
    return (
      <p className={CLASSES.NO_OPTIONS_TEXT}>{LABELS.NO_OPTIONS}</p>
    );
  }

  return (
    <>
      {options.map((option) => {
        const isSelected = selectedValues.includes(option.value);
        return (
          <OptionItem
            key={option.value}
            option={option}
            isSelected={isSelected}
            onToggle={onToggle}
          />
        );
      })}
    </>
  );
}

function SelectedPreview({
  selectedLabels,
  selectedValues,
  onRemove,
}: {
  selectedLabels: string[];
  selectedValues: string[];
  onRemove: (value: string) => void;
}) {
  if (selectedLabels.length === 0) {
    return null;
  }

  return (
    <div className={CLASSES.SELECTED_PREVIEW}>
      {selectedLabels.map((label, index) => (
        <SelectedBadge
          key={index}
          label={label}
          value={selectedValues[index]}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function MultiSelectFilter({
  title,
  options,
  selectedValues,
  onValuesChange,
  icon,
}: MultiSelectFilterProps) {
  // State
  const [isOpen, setIsOpen] = useState(false);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const selectedLabels = useMemo(
    () => getSelectedLabels(options, selectedValues),
    [options, selectedValues]
  );

  const hasSelection = useMemo(
    () => selectedValues.length > 0,
    [selectedValues.length]
  );

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const toggleValue = useCallback(
    (value: string) => {
      if (selectedValues.includes(value)) {
        onValuesChange(selectedValues.filter((v) => v !== value));
      } else {
        onValuesChange([...selectedValues, value]);
      }
    },
    [selectedValues, onValuesChange]
  );

  const clearFilters = useCallback(() => {
    onValuesChange([]);
    setIsOpen(false);
  }, [onValuesChange]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={CLASSES.CONTAINER}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <TriggerButton
            title={title}
            icon={icon}
            selectedCount={selectedValues.length}
          />
        </PopoverTrigger>

        <PopoverContent className={CLASSES.POPOVER_CONTENT} align={POPOVER_CONFIG.ALIGN}>
          <div className={CLASSES.POPOVER_INNER}>
            <PopoverHeader
              title={title}
              hasSelection={hasSelection}
              onClear={clearFilters}
            />

            <div className={CLASSES.OPTIONS_CONTAINER}>
              <OptionsList
                options={options}
                selectedValues={selectedValues}
                onToggle={toggleValue}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <SelectedPreview
        selectedLabels={selectedLabels}
        selectedValues={selectedValues}
        onRemove={toggleValue}
      />
    </div>
  );
}
