'use client';

import { useEffect, useState } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ClusterLayer } from './ClusterLayer';
import { HeatmapLayer } from './HeatmapLayer';

// Fix para ícones do Leaflet no Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

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

interface MapContainerProps {
  entities: MapEntity[];
  center?: [number, number];
  zoom?: number;
  viewMode?: ViewMode;
  onMarkerClick?: (entity: MapEntity) => void;
}

// Componente para ajustar bounds do mapa
function MapBounds({ entities }: { entities: MapEntity[] }) {
  const map = useMap();

  useEffect(() => {
    if (entities.length > 0) {
      // Filtrar entidades com coordenadas válidas
      const validEntities = entities.filter(
        (e) =>
          typeof e.latitude === 'number' &&
          typeof e.longitude === 'number' &&
          !isNaN(e.latitude) &&
          !isNaN(e.longitude) &&
          isFinite(e.latitude) &&
          isFinite(e.longitude)
      );

      if (validEntities.length > 0) {
        try {
          const bounds = L.latLngBounds(
            validEntities.map((e) => [e.latitude, e.longitude] as [number, number])
          );
          map.fitBounds(bounds, { padding: [50, 50] });
        } catch (error) {
          console.error('Erro ao ajustar bounds do mapa:', error);
        }
      }
    }
  }, [entities, map]);

  return null;
}

// Criar ícones customizados por tipo
const createCustomIcon = (type: 'cliente' | 'lead' | 'concorrente', color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
      ">
        ${type === 'cliente' ? '🏢' : type === 'lead' ? '🎯' : '📈'}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

const getMarkerColor = (entity: MapEntity): string => {
  if (entity.type === 'cliente') return '#3b82f6'; // blue-600
  if (entity.type === 'concorrente') return '#ef4444'; // red-500

  // Leads: cor por qualidade
  const qualidade = (entity.qualidadeClassificacao as string)?.toLowerCase();
  if (qualidade === 'alto') return '#10b981'; // green-500
  if (qualidade === 'medio') return '#f59e0b'; // amber-500
  return '#6b7280'; // gray-500
};

export function MapContainer({
  entities,
  center,
  zoom = 5,
  viewMode = 'markers',
  onMarkerClick,
}: MapContainerProps) {
  const [mounted, setMounted] = useState(false);

  // Só renderizar no cliente (evita SSR issues)
  useEffect(() => {
    // Use setTimeout para evitar cascading renders
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Validar props antes de renderizar
  if (!entities || !Array.isArray(entities)) {
    console.warn('[MapContainer] Entidades inválidas:', typeof entities);
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

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Carregando mapa...</div>
      </div>
    );
  }

  const defaultCenter: [number, number] = center || [-15.7801, -47.9292]; // Centro do Brasil

  return (
    <LeafletMap
      center={defaultCenter}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {entities.length > 0 && <MapBounds entities={entities} />}

      {/* Modo Marcadores */}
      {viewMode === 'markers' &&
        entities.map((entity) => {
          const color = getMarkerColor(entity);
          const icon = createCustomIcon(entity.type, color);

          return (
            <Marker
              key={`${entity.type}-${entity.id}`}
              position={[entity.latitude, entity.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => onMarkerClick?.(entity),
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">
                      {entity.type === 'cliente' ? '🏢' : entity.type === 'lead' ? '🎯' : '📈'}
                    </span>
                    <span className="font-semibold text-sm uppercase text-gray-500">
                      {entity.type}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{entity.nome}</h3>
                  <p className="text-sm text-gray-600">
                    {entity.cidade} - {entity.uf}
                  </p>
                  {entity.setor && (
                    <p className="text-xs text-gray-500 mt-1">{entity.setor as string}</p>
                  )}
                  <button
                    onClick={() => onMarkerClick?.(entity)}
                    className="mt-3 w-full px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Ver Detalhes
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

      {/* Modo Cluster */}
      {viewMode === 'cluster' && <ClusterLayer entities={entities} onMarkerClick={onMarkerClick} />}

      {/* Modo Heatmap */}
      {viewMode === 'heatmap' && <HeatmapLayer entities={entities} />}
    </LeafletMap>
  );
}
