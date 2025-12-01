import { useState } from 'react';

export interface Filters {
  projectId: number | undefined;
  pesquisaId: number | undefined;
  setor: string | undefined;
  porte: string | undefined;
  qualidade: string | undefined;
}

export function useFilters() {
  const [filters, setFilters] = useState<Filters>({
    projectId: undefined,
    pesquisaId: undefined,
    setor: undefined,
    porte: undefined,
    qualidade: undefined,
  });

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => {
      // Se mudar projeto, reseta pesquisa
      if (key === 'projectId') {
        return { ...prev, [key]: value, pesquisaId: undefined };
      }
      return { ...prev, [key]: value };
    });
  };

  const clearFilters = () => {
    setFilters({
      projectId: undefined,
      pesquisaId: undefined,
      setor: undefined,
      porte: undefined,
      qualidade: undefined,
    });
  };

  const hasActiveFilters =
    !!filters.projectId ||
    !!filters.pesquisaId ||
    !!filters.setor ||
    !!filters.porte ||
    !!filters.qualidade;

  return {
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
  };
}
