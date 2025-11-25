"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Filters {
  search?: string;
  status?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  category?: string[];
  tags?: string[];
  [key: string]: unknown;
}

interface FilterContextType {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  updateFilter: (key: string, value: unknown) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<Filters>({});

  const updateFilter = (key: string, value: unknown) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <FilterContext.Provider
      value={{
        filters,
        setFilters,
        updateFilter,
        clearFilters,
        hasActiveFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
}
