'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MapView } from '@/components/Map';

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

export type ViewMode = 'markers' | 'cluster' | 'heatmap';

interface GoogleMapContainerProps {
  entities: MapEntity[];
  center?: [number, number];
  zoom?: number;
  viewMode?: ViewMode;
  onMarkerClick?: (entity: MapEntity) => void;
}

// Cores por tipo de entidade
const getMarkerColor = (entity: MapEntity): string => {
  if (entity.type === 'cliente') return '#3b82f6'; // blue-600
  if (entity.type === 'concorrente') return '#ef4444'; // red-500

  // Leads: cor por qualidade
  const qualidade = (entity.qualidadeClassificacao as string)?.toLowerCase();
  if (qualidade === 'alto') return '#10b981'; // green-500
  if (qualidade === 'medio') return '#f59e0b'; // amber-500
  return '#6b7280'; // gray-500
};

// Ícone por tipo de entidade
const getMarkerIcon = (entity: MapEntity): string => {
  if (entity.type === 'cliente') return '🏢';
  if (entity.type === 'lead') return '🎯';
  return '📈';
};

export function GoogleMapContainer({
  entities,
  center,
  zoom = 5,
  viewMode = 'markers',
  onMarkerClick,
}: GoogleMapContainerProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const googleRef = useRef<typeof google.maps | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const markerClustererRef = useRef<unknown>(null);
  const heatmapRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Limpar marcadores anteriores
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    if (markerClustererRef.current) {
      markerClustererRef.current.clearMarkers();
      markerClustererRef.current = null;
    }

    if (heatmapRef.current) {
      heatmapRef.current.setMap(null);
      heatmapRef.current = null;
    }
  }, []);

  // Criar marcadores
  const createMarkers = useCallback(
    (map: google.maps.Map, google: typeof google.maps) => {
      clearMarkers();

      const newMarkers = entities.map((entity) => {
        const color = getMarkerColor(entity);
        const icon = getMarkerIcon(entity);

        // Criar ícone customizado SVG
        const svgMarker = {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: color,
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 12,
        };

        const marker = new google.maps.Marker({
          position: { lat: entity.latitude, lng: entity.longitude },
          map: map,
          icon: svgMarker,
          title: entity.nome,
        });

        // Info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 12px; min-width: 200px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="font-size: 18px;">${icon}</span>
                <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #6b7280;">
                  ${entity.type}
                </span>
              </div>
              <h3 style="font-weight: 700; color: #111827; margin-bottom: 4px;">${entity.nome}</h3>
              <p style="font-size: 14px; color: #4b5563;">
                ${entity.cidade} - ${entity.uf}
              </p>
              ${entity.setor ? `<p style="font-size: 12px; color: #6b7280; margin-top: 4px;">${entity.setor}</p>` : ''}
              <button 
                onclick="window.dispatchEvent(new CustomEvent('marker-click', { detail: ${entity.id} }))"
                style="
                  margin-top: 12px;
                  width: 100%;
                  padding: 6px 12px;
                  background-color: #3b82f6;
                  color: white;
                  font-size: 14px;
                  border: none;
                  border-radius: 6px;
                  cursor: pointer;
                "
              >
                Ver Detalhes
              </button>
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
          onMarkerClick?.(entity);
        });

        return marker;
      });

      markersRef.current = newMarkers;
      return newMarkers;
    },
    [entities, onMarkerClick, clearMarkers]
  );

  // Criar clusters
  const createClusters = useCallback(
    async (map: google.maps.Map, google: typeof google.maps, markers: google.maps.Marker[]) => {
      // Importar MarkerClusterer dinamicamente
      const { MarkerClusterer } = await import('@googlemaps/markerclusterer');

      markerClustererRef.current = new MarkerClusterer({
        map,
        markers,
      });
    },
    []
  );

  // Criar heatmap
  const createHeatmap = useCallback(
    (map: google.maps.Map, google: typeof google.maps) => {
      const heatmapData = entities.map(
        (entity) => new google.maps.LatLng(entity.latitude, entity.longitude)
      );

      heatmapRef.current = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: map,
      });

      heatmapRef.current.set('radius', 20);
      heatmapRef.current.set('opacity', 0.6);
    },
    [entities]
  );

  // Ajustar bounds do mapa
  const fitBounds = useCallback(
    (map: google.maps.Map, google: typeof google.maps) => {
      const bounds = new google.maps.LatLngBounds();
      entities.forEach((entity) => {
        bounds.extend(new google.maps.LatLng(entity.latitude, entity.longitude));
      });
      map.fitBounds(bounds);
    },
    [entities]
  );

  // Callback quando o mapa está pronto
  const handleMapReady = useCallback(
    async (map: google.maps.Map, google: typeof google.maps) => {
      mapRef.current = map;
      googleRef.current = google;
      setIsReady(true);

      // Ajustar bounds
      fitBounds(map, google);

      // Criar marcadores
      const markers = createMarkers(map, google);

      // Aplicar modo de visualização
      if (viewMode === 'cluster') {
        await createClusters(map, google, markers);
      } else if (viewMode === 'heatmap') {
        // Esconder marcadores
        markers.forEach((marker) => marker.setMap(null));
        createHeatmap(map, google);
      }
    },
    [viewMode, createMarkers, createClusters, createHeatmap, fitBounds]
  );

  // Atualizar quando viewMode mudar
  useEffect(() => {
    if (!isReady || !mapRef.current || !googleRef.current) return;

    const map = mapRef.current;
    const google = googleRef.current;

    clearMarkers();

    const markers = createMarkers(map, google);

    if (viewMode === 'cluster') {
      createClusters(map, google, markers);
    } else if (viewMode === 'heatmap') {
      markers.forEach((marker) => marker.setMap(null));
      createHeatmap(map, google);
    }
  }, [viewMode, isReady, createMarkers, createClusters, createHeatmap, clearMarkers]);

  // Atualizar quando entities mudar
  useEffect(() => {
    if (!isReady || !mapRef.current || !googleRef.current) return;

    const map = mapRef.current;
    const google = googleRef.current;

    clearMarkers();
    fitBounds(map, google);

    const markers = createMarkers(map, google);

    if (viewMode === 'cluster') {
      createClusters(map, google, markers);
    } else if (viewMode === 'heatmap') {
      markers.forEach((marker) => marker.setMap(null));
      createHeatmap(map, google);
    }
  }, [
    entities,
    isReady,
    viewMode,
    createMarkers,
    createClusters,
    createHeatmap,
    fitBounds,
    clearMarkers,
  ]);

  const defaultCenter: [number, number] = center || [-15.7801, -47.9292]; // Centro do Brasil

  // Validar props
  if (!entities || !Array.isArray(entities)) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Erro ao carregar entidades</p>
          <p className="text-sm text-gray-500 mt-2">Dados inválidos</p>
        </div>
      </div>
    );
  }

  if (entities.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Nenhuma entidade para exibir</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <MapView
        center={{ lat: defaultCenter[0], lng: defaultCenter[1] }}
        zoom={zoom}
        onMapReady={handleMapReady}
      />
    </div>
  );
}
