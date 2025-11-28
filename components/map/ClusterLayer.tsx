'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

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

interface ClusterLayerProps {
  entities: MapEntity[];
  onMarkerClick?: (entity: MapEntity) => void;
}

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

export function ClusterLayer({ entities, onMarkerClick }: ClusterLayerProps) {
  const map = useMap();

  useEffect(() => {
    // Criar cluster group
    const markers = L.markerClusterGroup({
      chunkedLoading: true,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 80,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        let size = 'small';
        let bgColor = '#3b82f6';

        if (count > 100) {
          size = 'large';
          bgColor = '#dc2626';
        } else if (count > 50) {
          size = 'medium';
          bgColor = '#f59e0b';
        }

        return L.divIcon({
          html: `<div style="
            background-color: ${bgColor};
            color: white;
            border-radius: 50%;
            width: ${size === 'large' ? '50px' : size === 'medium' ? '40px' : '30px'};
            height: ${size === 'large' ? '50px' : size === 'medium' ? '40px' : '30px'};
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: ${size === 'large' ? '16px' : size === 'medium' ? '14px' : '12px'};
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            border: 3px solid white;
          ">${count}</div>`,
          className: 'marker-cluster-custom',
          iconSize: L.point(
            size === 'large' ? 50 : size === 'medium' ? 40 : 30,
            size === 'large' ? 50 : size === 'medium' ? 40 : 30
          ),
        });
      },
    });

    // Adicionar marcadores ao cluster
    entities.forEach((entity) => {
      const color = getMarkerColor(entity);
      const icon = createCustomIcon(entity.type, color);

      const marker = L.marker([entity.latitude, entity.longitude], { icon });

      // Popup
      marker.bindPopup(`
        <div style="padding: 8px; min-width: 200px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="font-size: 18px;">
              ${entity.type === 'cliente' ? '🏢' : entity.type === 'lead' ? '🎯' : '📈'}
            </span>
            <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; color: #6b7280;">
              ${entity.type}
            </span>
          </div>
          <h3 style="font-weight: bold; color: #111827; margin-bottom: 4px;">${entity.nome}</h3>
          <p style="font-size: 14px; color: #4b5563;">
            ${entity.cidade} - ${entity.uf}
          </p>
          ${entity.setor ? `<p style="font-size: 12px; color: #6b7280; margin-top: 4px;">${entity.setor}</p>` : ''}
          <button 
            onclick="window.dispatchEvent(new CustomEvent('marker-click', { detail: ${JSON.stringify({ id: entity.id, type: entity.type })} }))"
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
      `);

      markers.addLayer(marker);
    });

    // Adicionar cluster ao mapa
    map.addLayer(markers);

    // Event listener para click nos marcadores
    const handleMarkerClick = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { id, type } = customEvent.detail;
      const entity = entities.find((ent) => ent.id === id && ent.type === type);
      if (entity && onMarkerClick) {
        onMarkerClick(entity);
      }
    };

    window.addEventListener('marker-click', handleMarkerClick);

    // Cleanup
    return () => {
      map.removeLayer(markers);
      window.removeEventListener('marker-click', handleMarkerClick);
    };
  }, [entities, map, onMarkerClick]);

  return null;
}
