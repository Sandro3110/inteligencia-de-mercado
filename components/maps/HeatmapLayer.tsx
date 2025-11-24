'use client';

/**
 * Componente de Layer de Heatmap para Leaflet
 *
 * Usa leaflet.heat para criar visualização de densidade
 */

import { useEffect, useMemo } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity?: number;
}

interface HeatmapOptions {
  /** Raio de cada ponto em pixels (padrão: 25) */
  radius?: number;
  /** Quantidade de blur (padrão: 15) */
  blur?: number;
  /** Zoom máximo onde o heatmap é visível (padrão: 17) */
  maxZoom?: number;
  /** Intensidade máxima (padrão: 1.0) */
  max?: number;
  /** Gradiente de cores personalizado */
  gradient?: Record<number, string>;
}

interface HeatmapLayerProps {
  /** Array de pontos [lat, lng, intensity] */
  points: HeatmapPoint[];
  /** Opções de configuração do heatmap */
  options?: HeatmapOptions;
}

// Extend Leaflet type to include heatLayer
declare module 'leaflet' {
  function heatLayer(
    latlngs: [number, number, number][],
    options?: HeatmapOptions
  ): L.Layer;
}

const DEFAULT_GRADIENT: Record<number, string> = {
  0.0: 'blue',
  0.5: 'lime',
  0.7: 'yellow',
  0.9: 'orange',
  1.0: 'red',
};

const DEFAULT_OPTIONS = {
  radius: 25,
  blur: 15,
  maxZoom: 17,
  max: 1.0,
} as const;

/**
 * Layer de heatmap para visualização de densidade de pontos
 *
 * @example
 * ```tsx
 * <MapContainer>
 *   <HeatmapLayer
 *     points={[
 *       { lat: -23.55, lng: -46.63, intensity: 0.8 },
 *       { lat: -22.90, lng: -43.17, intensity: 1.0 }
 *     ]}
 *     options={{ radius: 30, blur: 20 }}
 *   />
 * </MapContainer>
 * ```
 */
export default function HeatmapLayer({ points, options = {} }: HeatmapLayerProps) {
  const map = useMap();

  // Memoize heat points conversion
  const heatPoints = useMemo<[number, number, number][]>(() => {
    if (!points || points.length === 0) return [];
    return points.map((p) => [p.lat, p.lng, p.intensity ?? 1.0]);
  }, [points]);

  useEffect(() => {
    if (heatPoints.length === 0) {
      return;
    }

    // Criar layer de heatmap
    const heatLayer = (L as typeof L & { heatLayer: typeof L.heatLayer }).heatLayer(heatPoints, {
      radius: options.radius ?? DEFAULT_OPTIONS.radius,
      blur: options.blur ?? DEFAULT_OPTIONS.blur,
      maxZoom: options.maxZoom ?? DEFAULT_OPTIONS.maxZoom,
      max: options.max ?? DEFAULT_OPTIONS.max,
      gradient: options.gradient ?? DEFAULT_GRADIENT,
    });

    // Adicionar ao mapa
    heatLayer.addTo(map);

    // Cleanup: remover layer quando componente desmontar
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, heatPoints, options]);

  return null; // Componente não renderiza nada visualmente
}
