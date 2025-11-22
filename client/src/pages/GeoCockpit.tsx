/**
 * Geo Cockpit Unificado - Sistema de Visualização em Mapas
 * 
 * Visualização unificada de todas as entidades (mercados, clientes, produtos, concorrentes, leads)
 * com controles avançados, filtros e clustering inteligente
 */

import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, Map as MapIcon } from 'lucide-react';
import MapContainer from '@/components/maps/MapContainer';
import HeatmapLayer from '@/components/maps/HeatmapLayer';
import EntityMarker from '@/components/maps/EntityMarker';
import EntityPopupCard from '@/components/maps/EntityPopupCard';
import MapLegend from '@/components/maps/MapLegend';
import MapControls, { MapControlsConfig } from '@/components/maps/MapControls';
import MapFilters, { MapFiltersState } from '@/components/maps/MapFilters';
import DashboardLayout from '@/components/DashboardLayout';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useSelectedProject } from '@/hooks/useSelectedProject';
import { useSelectedPesquisa } from '@/hooks/useSelectedPesquisa';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

type EntityType = 'mercado' | 'cliente' | 'produto' | 'concorrente' | 'lead';

export default function GeoCockpit() {
  const { selectedProjectId } = useSelectedProject();
  const { selectedPesquisaId } = useSelectedPesquisa();

  // Estado de entidades ativas (quais mostrar no mapa)
  const [activeEntityTypes, setActiveEntityTypes] = useState<Set<string>>(
    new Set(['mercado', 'cliente', 'concorrente', 'lead'])
  );

  // Estado de controles do mapa
  const [mapControls, setMapControls] = useState<MapControlsConfig>({
    viewMode: 'markers',
    enableClustering: true,
    clusterRadius: 50,
    autoAdjustZoom: true,
  });

  // Estado de filtros
  const [filters, setFilters] = useState<MapFiltersState>({
    searchText: '',
    minQuality: 0,
    selectedMercados: [],
    selectedUFs: [],
  });

  // Estado do popup de detalhes
  const [selectedEntity, setSelectedEntity] = useState<{
    type: EntityType;
    id: number;
  } | null>(null);

  // Buscar todas as entidades do mapa
  const { data: entities, isLoading: entitiesLoading } = trpc.unifiedMap.getAllEntities.useQuery(
    {
      projectId: selectedProjectId!,
      pesquisaId: selectedPesquisaId ?? undefined,
      entityTypes: Array.from(activeEntityTypes) as EntityType[],
      minQuality: filters.minQuality > 0 ? filters.minQuality : undefined,
      searchText: filters.searchText || undefined,
      mercadoIds: filters.selectedMercados.length > 0 ? filters.selectedMercados : undefined,
      ufs: filters.selectedUFs.length > 0 ? filters.selectedUFs : undefined,
    },
    { enabled: !!selectedProjectId }
  );

  // Buscar estatísticas do mapa
  const { data: mapStats } = trpc.unifiedMap.getMapStats.useQuery(
    {
      projectId: selectedProjectId!,
      pesquisaId: selectedPesquisaId ?? undefined,
    },
    { enabled: !!selectedProjectId }
  );

  // Filtrar entidades localmente (para busca em tempo real)
  const filteredEntities = useMemo(() => {
    if (!entities) return [];
    return entities;
  }, [entities]);

  // Transformar para heatmap
  const heatmapPoints = useMemo(() => {
    if (!filteredEntities) return [];
    return filteredEntities.map((entity) => ({
      lat: entity.latitude,
      lng: entity.longitude,
      intensity: (entity.qualidadeScore || 50) / 100,
    }));
  }, [filteredEntities]);

  // Calcular centro do mapa
  const mapCenter = useMemo((): [number, number] => {
    if (!filteredEntities || filteredEntities.length === 0) {
      return [-14.235, -51.9253]; // Brasil
    }
    const avgLat =
      filteredEntities.reduce((sum, e) => sum + e.latitude, 0) / filteredEntities.length;
    const avgLng =
      filteredEntities.reduce((sum, e) => sum + e.longitude, 0) / filteredEntities.length;
    return [avgLat, avgLng];
  }, [filteredEntities]);

  // Handler para toggle de tipo de entidade
  const handleToggleEntityType = (type: string) => {
    const newSet = new Set(activeEntityTypes);
    if (newSet.has(type)) {
      newSet.delete(type);
    } else {
      newSet.add(type);
    }
    setActiveEntityTypes(newSet);
  };

  // Handler para clique em marcador
  const handleMarkerClick = (type: EntityType, id: number) => {
    setSelectedEntity({ type, id });
  };

  // Verificar se projeto está selecionado
  if (!selectedProjectId) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Selecione um projeto para visualizar o mapa geográfico.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MapIcon className="h-8 w-8" />
            Geo Cockpit
          </h1>
          <p className="text-muted-foreground mt-2">
            Visualização unificada de mercados, clientes, produtos, concorrentes e leads no mapa
          </p>
        </div>

        {/* Controles e Filtros */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <MapControls config={mapControls} onChange={setMapControls} />
            <MapFilters
              projectId={selectedProjectId}
              pesquisaId={selectedPesquisaId ?? undefined}
              filters={filters}
              onChange={setFilters}
            />
          </div>

          {/* Mapa */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapIcon className="h-5 w-5" />
                  Visualização Geográfica
                </CardTitle>
              </CardHeader>
              <CardContent>
                {entitiesLoading ? (
                  <Skeleton className="h-[600px] w-full" />
                ) : filteredEntities && filteredEntities.length > 0 ? (
                  <div className="h-[600px] rounded-lg overflow-hidden border relative">
                    <MapContainer
                      center={mapCenter}
                      zoom={mapControls.autoAdjustZoom ? 5 : undefined}
                    >
                      {/* Heatmap Layer */}
                      {(mapControls.viewMode === 'heatmap' || mapControls.viewMode === 'hybrid') && (
                        <HeatmapLayer points={heatmapPoints} />
                      )}

                      {/* Markers */}
                      {(mapControls.viewMode === 'markers' || mapControls.viewMode === 'hybrid') && (
                        <>
                          {mapControls.enableClustering ? (
                            <MarkerClusterGroup
                              chunkedLoading
                              maxClusterRadius={mapControls.clusterRadius}
                              showCoverageOnHover={false}
                            >
                              {filteredEntities.map((entity) => (
                                <EntityMarker
                                  key={`${entity.type}-${entity.id}`}
                                  position={[entity.latitude, entity.longitude]}
                                  type={entity.type}
                                  nome={entity.nome}
                                  qualidadeScore={entity.qualidadeScore}
                                  onClick={() => handleMarkerClick(entity.type, entity.id)}
                                />
                              ))}
                            </MarkerClusterGroup>
                          ) : (
                            <>
                              {filteredEntities.map((entity) => (
                                <EntityMarker
                                  key={`${entity.type}-${entity.id}`}
                                  position={[entity.latitude, entity.longitude]}
                                  type={entity.type}
                                  nome={entity.nome}
                                  qualidadeScore={entity.qualidadeScore}
                                  onClick={() => handleMarkerClick(entity.type, entity.id)}
                                />
                              ))}
                            </>
                          )}
                        </>
                      )}
                    </MapContainer>

                    {/* Legenda */}
                    {mapStats && (
                      <MapLegend
                        stats={mapStats.byType}
                        activeTypes={activeEntityTypes}
                        onToggleType={handleToggleEntityType}
                      />
                    )}
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Nenhuma entidade com coordenadas encontrada. Execute a geocodificação primeiro.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Estatísticas */}
        {mapStats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mapStats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-600">Mercados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mapStats.byType.mercado}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-600">Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mapStats.byType.cliente}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-600">Concorrentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mapStats.byType.concorrente}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-600">Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mapStats.byType.lead}</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Popup de Detalhes */}
      {selectedEntity && (
        <EntityPopupCard
          isOpen={!!selectedEntity}
          onClose={() => setSelectedEntity(null)}
          entityType={selectedEntity.type}
          entityId={selectedEntity.id}
        />
      )}
    </DashboardLayout>
  );
}
