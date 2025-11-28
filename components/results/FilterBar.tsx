'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FilterOption {
  key: string;
  label: string;
  options: string[];
}

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  filterOptions: FilterOption[];
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange,
  onClearFilters,
  filterOptions,
}: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const activeFiltersCount = Object.values(filters).filter((v) => v).length;

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </Button>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" onClick={onClearFilters} className="flex items-center gap-2">
            <X className="w-4 h-4" />
            Limpar
          </Button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filterOptions.map((filterOption) => (
              <div key={filterOption.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {filterOption.label}
                </label>
                <select
                  value={filters[filterOption.key] || ''}
                  onChange={(e) => onFilterChange(filterOption.key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  {filterOption.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
