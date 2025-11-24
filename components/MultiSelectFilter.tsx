'use client';

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface MultiSelectFilterProps {
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onValuesChange: (values: string[]) => void;
  icon?: React.ReactNode;
}

export function MultiSelectFilter({
  title,
  options,
  selectedValues,
  onValuesChange,
  icon,
}: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleValue = (value: string) => {
    if (selectedValues.includes(value)) {
      onValuesChange(selectedValues.filter(v => v !== value));
    } else {
      onValuesChange([...selectedValues, value]);
    }
  };

  const clearFilters = () => {
    onValuesChange([]);
    setIsOpen(false);
  };

  const selectedLabels = options
    .filter(opt => selectedValues.includes(opt.value))
    .map(opt => opt.label);

  return (
    <div className="space-y-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              {icon}
              <span className="text-xs">{title}</span>
            </div>
            <div className="flex items-center gap-1">
              {selectedValues.length > 0 && (
                <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                  {selectedValues.length}
                </Badge>
              )}
              <ChevronDown className="w-3 h-3" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-3" align="start">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{title}</label>
              {selectedValues.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-6 px-2 text-xs"
                >
                  Limpar
                </Button>
              )}
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {options.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Nenhuma opção disponível
                </p>
              ) : (
                options.map(option => {
                  const isSelected = selectedValues.includes(option.value);
                  return (
                    <div
                      key={option.value}
                      className="flex items-center gap-2 p-2 rounded hover:bg-accent/50 cursor-pointer"
                      onClick={() => toggleValue(option.value)}
                    >
                      <Checkbox checked={isSelected} />
                      <label className="text-sm flex-1 cursor-pointer">
                        {option.label}
                      </label>
                      {option.count !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          ({option.count})
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected values preview */}
      {selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedLabels.map((label, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-[10px] px-2 py-0.5"
            >
              {label}
              <button
                onClick={() => toggleValue(selectedValues[index])}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
