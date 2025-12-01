'use client';

import { X } from 'lucide-react';
import type { Filters } from '@/hooks/useFilters';

interface FiltersPanelProps {
  filters: Filters;
  updateFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  projects?: Array<{ id: number; nome: string }>;
  pesquisas?: Array<{ id: number; nome: string }>;
  availableFilters?: {
    setores?: string[];
    portes?: string[];
    qualidades?: string[];
  };
}

export function FiltersPanel({
  filters,
  updateFilter,
  clearFilters,
  hasActiveFilters,
  projects,
  pesquisas,
  availableFilters,
}: FiltersPanelProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Projeto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Projeto</label>
            <select
              value={filters.projectId || ''}
              onChange={(e) => {
                const value = e.target.value ? Number(e.target.value) : undefined;
                updateFilter('projectId', value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              {projects?.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Pesquisa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pesquisa</label>
            <select
              value={filters.pesquisaId || ''}
              onChange={(e) => {
                const value = e.target.value ? Number(e.target.value) : undefined;
                updateFilter('pesquisaId', value);
              }}
              disabled={!filters.projectId}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Todas</option>
              {pesquisas?.map((pesquisa) => (
                <option key={pesquisa.id} value={pesquisa.id}>
                  {pesquisa.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Setor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Setor</label>
            <select
              value={filters.setor || ''}
              onChange={(e) => updateFilter('setor', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              {availableFilters?.setores?.map((setor) => (
                <option key={setor} value={setor}>
                  {setor}
                </option>
              ))}
            </select>
          </div>

          {/* Porte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Porte</label>
            <select
              value={filters.porte || ''}
              onChange={(e) => updateFilter('porte', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              {availableFilters?.portes?.map((porte) => (
                <option key={porte} value={porte}>
                  {porte}
                </option>
              ))}
            </select>
          </div>

          {/* Qualidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Qualidade</label>
            <select
              value={filters.qualidade || ''}
              onChange={(e) => updateFilter('qualidade', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas</option>
              {availableFilters?.qualidades?.map((qualidade) => (
                <option key={qualidade} value={qualidade}>
                  {qualidade}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 font-medium"
            >
              <X className="w-4 h-4" />
              Limpar Filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
