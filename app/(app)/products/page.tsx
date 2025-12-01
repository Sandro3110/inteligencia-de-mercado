'use client';

import { useState } from 'react';
import { Package } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { useFilters } from '@/hooks/useFilters';
import { FiltersHeader, FiltersPanel } from '@/components/shared-filters';
import { ProductDrillDownStandalone } from '@/components/drill-down';
import { toast } from 'sonner';

export default function ProdutosPage() {
  const [showFilters, setShowFilters] = useState(false);
  const { filters, updateFilter, clearFilters, hasActiveFilters } = useFilters();

  // Queries
  const { data: projects } = trpc.projects.list.useQuery();
  const { data: pesquisas } = trpc.pesquisas.list.useQuery(
    { projectId: filters.projectId ?? 0 },
    { enabled: !!filters.projectId }
  );
  const { data: availableFilters } = trpc.unifiedMap.getAvailableFilters.useQuery({
    projectId: filters.projectId,
    pesquisaId: filters.pesquisaId,
  });

  const handleExportExcel = () => {
    toast.info('Use os botões de exportação dentro das tabelas de drill-down');
  };

  const handleExportCSV = () => {
    toast.info('Use os botões de exportação dentro das tabelas de drill-down');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <FiltersHeader
        title="Análise de Produtos"
        icon={<Package className="w-6 h-6 text-blue-600" />}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        hasActiveFilters={hasActiveFilters}
        onExportExcel={handleExportExcel}
        onExportCSV={handleExportCSV}
      />

      {/* Filtros Panel */}
      {showFilters && (
        <FiltersPanel
          filters={filters}
          updateFilter={updateFilter}
          clearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
          projects={projects}
          pesquisas={pesquisas}
          availableFilters={availableFilters}
        />
      )}

      {/* Drill-Down Content */}
      <div className="flex-1 overflow-auto p-6">
        <ProductDrillDownStandalone
          projectId={filters.projectId}
          pesquisaId={filters.pesquisaId}
          filters={{
            setor: filters.setor,
            porte: filters.porte,
            qualidade: filters.qualidade,
          }}
        />
      </div>
    </div>
  );
}
