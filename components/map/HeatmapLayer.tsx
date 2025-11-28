'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

interface MapEntity {
  id: number;
  type: 'cliente' | 'lead' | 'concorrente';
  latitude: number;
  longitude: number;
  [key: string]: unknown;
}

interface HeatmapLayerProps {
  entities: MapEntity[];
  intensity?: number;
}

export function HeatmapLayer({ entities, intensity = 0.5 }: HeatmapLayerProps) {
  const map = useMap();

  useEffect(() => {
    // Preparar dados para heatmap
    // Formato: [latitude, longitude, intensity]
    const heatData: [number, number, number][] = entities.map((entity) => {
      // Intensidade baseada no tipo
      let weight = 0.5;

      if (entity.type === 'cliente') {
        weight = 1.0; // Clientes têm peso máximo
      } else if (entity.type === 'lead') {
        // Leads: peso por qualidade
        const qualidade = (entity.qualidadeClassificacao as string)?.toLowerCase();
        if (qualidade === 'alto') weight = 0.9;
        else if (qualidade === 'medio') weight = 0.6;
        else weight = 0.3;
      } else if (entity.type === 'concorrente') {
        weight = 0.7; // Concorrentes têm peso médio-alto
      }

      return [entity.latitude, entity.longitude, weight];
    });

    // Criar heatmap layer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const heatLayer = (L as any).heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.0: 'blue',
        0.3: 'cyan',
        0.5: 'lime',
        0.7: 'yellow',
        1.0: 'red',
      },
    });

    heatLayer.addTo(map);

    // Cleanup
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [entities, intensity, map]);

  return null;
}
