'use client';

import React, { useState, useRef } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Map as MapIcon, Filter, X, Download } from 'lucide-react';
import dynamic from 'next/dynamic';
import { MapSidebar } from '@/components/map/MapSidebar';
import { EntityDetailCard } from '@/components/map/EntityDetailCard';
import { ExportMapModal, type ExportOptions } from '@/components/map/ExportMapModal';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import type { ViewMode } from '@/components/map/MapContainer';

// Importar MapContainer dinamicamente para evitar SSR
const MapContainer = dynamic(
  () => import('@/components/map/MapContainer').then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando mapa...</p>
        </div>
      </div>
    ),
  }
);

interface MapEntity {
  id: number;
  type: 'cliente' | 'lead' | 'concorrente';
  nome: string;
  latitude: number;
  longitude: number;
  cidade: string;
  uf: string;
  [key: string]: unknown;
}

export default function MapPage() {
  const [selectedEntity, setSelectedEntity] = useState<MapEntity | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('markers');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState({
    entityTypes: ['clientes', 'leads', 'concorrentes'] as ('clientes' | 'leads' | 'concorrentes')[],
    projectId: undefined as number | undefined,
    pesquisaId: undefined as number | undefined,
    uf: undefined as string | undefined,
    cidade: undefined as string | undefined,
    setor: undefined as string | undefined,
    porte: undefined as string | undefined,
    qualidade: undefined as string | undefined,
  });

  // Queries
  const { data: mapData, isLoading } = trpc.map.getMapData.useQuery({
    entityTypes: filters.entityTypes,
    projectId: filters.projectId,
    pesquisaId: filters.pesquisaId,
    filters: {
      uf: filters.uf,
      cidade: filters.cidade,
      setor: filters.setor,
      porte: filters.porte,
      qualidade: filters.qualidade,
    },
  });

  // Buscar projetos e pesquisas para os dropdowns
  const { data: projects } = trpc.dashboard.getProjects.useQuery();
  const { data: allPesquisas } = trpc.pesquisas.list.useQuery({});

  // Filtrar pesquisas no frontend por projectId
  const pesquisas = React.useMemo(() => {
    console.log(
      '[MAP] useMemo pesquisas - allPesquisas:',
      allPesquisas?.length,
      'projectId:',
      filters.projectId
    );
    if (!allPesquisas) {
      console.log('[MAP] allPesquisas é null/undefined');
      return [];
    }
    if (!filters.projectId) {
      console.log('[MAP] projectId não definido, retornando array vazio');
      return [];
    }
    const filtered = allPesquisas.filter((p) => p.projectId === filters.projectId);
    console.log(
      '[MAP] Pesquisas filtradas:',
      filtered.length,
      'nomes:',
      filtered.map((p) => p.nome)
    );
    return filtered;
  }, [allPesquisas, filters.projectId]);

  const { data: availableFilters } = trpc.map.getAvailableFilters.useQuery({
    projectId: filters.projectId,
    pesquisaId: filters.pesquisaId,
  });

  const entities = (mapData || []) as MapEntity[];

  const handleMarkerClick = (entity: MapEntity) => {
    setSelectedEntity(entity);
  };

  const handleEntityClick = (entity: MapEntity) => {
    setSelectedEntity(entity);
  };

  const toggleEntityType = (type: 'clientes' | 'leads' | 'concorrentes') => {
    setFilters((prev) => ({
      ...prev,
      entityTypes: prev.entityTypes.includes(type)
        ? prev.entityTypes.filter((t) => t !== type)
        : [...prev.entityTypes, type],
    }));
  };

  const clearFilters = () => {
    setFilters({
      entityTypes: ['clientes', 'leads', 'concorrentes'],
      projectId: undefined,
      pesquisaId: undefined,
      uf: undefined,
      cidade: undefined,
      setor: undefined,
      porte: undefined,
      qualidade: undefined,
    });
  };

  const hasActiveFilters =
    filters.projectId ||
    filters.pesquisaId ||
    filters.uf ||
    filters.cidade ||
    filters.setor ||
    filters.porte ||
    filters.qualidade;

  const handleExport = async (options: ExportOptions) => {
    try {
      setIsExporting(true);
      toast.info('Capturando imagem do mapa...');

      // Capturar imagem do mapa
      if (!mapContainerRef.current) {
        throw new Error('Mapa não encontrado');
      }

      const canvas = await html2canvas(mapContainerRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#f9fafb',
      });

      const mapImage = canvas.toDataURL('image/png');

      toast.info('Gerando PDF...');

      // Preparar dados para exportação
      const exportData = {
        mapImage,
        options,
        filters: {
          projectId: filters.projectId,
          pesquisaId: filters.pesquisaId,
          entityTypes: filters.entityTypes,
          uf: filters.uf,
          cidade: filters.cidade,
          setor: filters.setor,
          porte: filters.porte,
          qualidade: filters.qualidade,
        },
        entities: entities,
      };

      // Chamar API de exportação
      const response = await fetch('/api/export/map-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportData),
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar PDF');
      }

      // Download do PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mapa_${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('PDF exportado com sucesso!');
      setShowExportModal(false);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapIcon className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Mapa Geográfico</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Entity Type Toggles */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleEntityType('clientes')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filters.entityTypes.includes('clientes')
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                🏢 Clientes
              </button>
              <button
                onClick={() => toggleEntityType('leads')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filters.entityTypes.includes('leads')
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                🎯 Leads
              </button>
              <button
                onClick={() => toggleEntityType('concorrentes')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filters.entityTypes.includes('concorrentes')
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                📈 Concorrentes
              </button>
            </div>

            {/* View Mode Selector */}
            <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
              <button
                onClick={() => setViewMode('markers')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'markers'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Marcadores individuais"
              >
                📍 Marcadores
              </button>
              <button
                onClick={() => setViewMode('cluster')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'cluster'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Agrupar marcadores próximos"
              >
                🔵 Clusters
              </button>
              <button
                onClick={() => setViewMode('heatmap')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'heatmap'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Mapa de calor (densidade)"
              >
                🔥 Heatmap
              </button>
            </div>

            {/* Export Button */}
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar PDF
            </button>

            {/* Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filtros
              {hasActiveFilters && (
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {
                    [
                      filters.uf,
                      filters.cidade,
                      filters.setor,
                      filters.porte,
                      filters.qualidade,
                    ].filter(Boolean).length
                  }
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-7 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Projeto</label>
                <select
                  value={filters.projectId || ''}
                  onChange={(e) => {
                    const projectId = e.target.value ? parseInt(e.target.value) : undefined;
                    setFilters({ ...filters, projectId, pesquisaId: undefined });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  {projects?.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pesquisa</label>
                <select
                  value={filters.pesquisaId || ''}
                  onChange={(e) => {
                    const pesquisaId = e.target.value ? parseInt(e.target.value) : undefined;
                    setFilters({ ...filters, pesquisaId });
                  }}
                  disabled={!filters.projectId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Todas</option>
                  {pesquisas?.map((pesquisa) => (
                    <option key={pesquisa.id} value={pesquisa.id}>
                      {pesquisa.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={filters.uf || ''}
                  onChange={(e) => setFilters({ ...filters, uf: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  {availableFilters?.ufs.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                <select
                  value={filters.cidade || ''}
                  onChange={(e) => setFilters({ ...filters, cidade: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas</option>
                  {availableFilters?.cidades.map((cidade) => (
                    <option key={cidade} value={cidade}>
                      {cidade}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Setor</label>
                <select
                  value={filters.setor || ''}
                  onChange={(e) => setFilters({ ...filters, setor: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  {availableFilters?.setores.map((setor) => (
                    <option key={setor} value={setor}>
                      {setor}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Porte</label>
                <select
                  value={filters.porte || ''}
                  onChange={(e) => setFilters({ ...filters, porte: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  {availableFilters?.portes.map((porte) => (
                    <option key={porte} value={porte}>
                      {porte}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qualidade (Lead)
                </label>
                <select
                  value={filters.qualidade || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, qualidade: e.target.value || undefined })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas</option>
                  {availableFilters?.qualidades.map((qual) => (
                    <option key={qual} value={qual}>
                      {qual}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
                >
                  <X className="w-4 h-4" />
                  Limpar Filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map and Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div ref={mapContainerRef} className="flex-1 relative">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando dados...</p>
              </div>
            </div>
          ) : entities.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <MapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Nenhuma entidade encontrada
                </p>
                <p className="text-sm text-gray-500">
                  Ajuste os filtros ou adicione dados com coordenadas geográficas
                </p>
              </div>
            </div>
          ) : (
            <MapContainer
              entities={entities}
              viewMode={viewMode}
              onMarkerClick={handleMarkerClick}
            />
          )}
        </div>

        {/* Sidebar */}
        <MapSidebar
          entities={entities}
          selectedEntity={selectedEntity}
          onEntityClick={handleEntityClick}
        />
      </div>

      {/* Entity Detail Modal */}
      {selectedEntity && (
        <EntityDetailCard entity={selectedEntity} onClose={() => setSelectedEntity(null)} />
      )}

      {/* Export Modal */}
      <ExportMapModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        isExporting={isExporting}
      />
    </div>
  );
}
