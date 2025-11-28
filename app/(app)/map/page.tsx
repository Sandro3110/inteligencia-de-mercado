'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Map as MapIcon, Filter, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { MapSidebar } from '@/components/map/MapSidebar';
import { EntityDetailCard } from '@/components/map/EntityDetailCard';
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
  const [viewMode, setViewMode] = useState<ViewMode>('markers');
  const [filters, setFilters] = useState({
    entityTypes: ['clientes', 'leads', 'concorrentes'] as ('clientes' | 'leads' | 'concorrentes')[],
    uf: undefined as string | undefined,
    cidade: undefined as string | undefined,
    setor: undefined as string | undefined,
    porte: undefined as string | undefined,
    qualidade: undefined as string | undefined,
  });

  // Queries
  const { data: mapData, isLoading } = trpc.map.getMapData.useQuery({
    entityTypes: filters.entityTypes,
    filters: {
      uf: filters.uf,
      cidade: filters.cidade,
      setor: filters.setor,
      porte: filters.porte,
      qualidade: filters.qualidade,
    },
  });

  const { data: availableFilters } = trpc.map.getAvailableFilters.useQuery({});

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
      uf: undefined,
      cidade: undefined,
      setor: undefined,
      porte: undefined,
      qualidade: undefined,
    });
  };

  const hasActiveFilters =
    filters.uf || filters.cidade || filters.setor || filters.porte || filters.qualidade;

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
        <div className="flex-1 relative">
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
    </div>
  );
}
