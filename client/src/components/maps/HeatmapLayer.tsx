/**
 * Componente de Layer de Heatmap para Leaflet
 * 
 * Usa leaflet.heat para criar visualização de densidade
 */

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity?: number;
}

interface HeatmapLayerProps {
  /** Array de pontos [lat, lng, intensity] */
  points: HeatmapPoint[];
  /** Opções de configuração do heatmap */
  options?: {
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
  };
}

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

  useEffect(() => {
    if (!points || points.length === 0) {
      return;
    }

    // Converter pontos para formato do leaflet.heat: [lat, lng, intensity]
    const heatPoints: [number, number, number][] = points.map(p => [
      p.lat,
      p.lng,
      p.intensity ?? 1.0
    ]);

    // Criar layer de heatmap
    const heatLayer = (L as any).heatLayer(heatPoints, {
      radius: options.radius || 25,
      blur: options.blur || 15,
      maxZoom: options.maxZoom || 17,
      max: options.max || 1.0,
      gradient: options.gradient || {
        0.0: 'blue',
        0.5: 'lime',
        0.7: 'yellow',
        0.9: 'orange',
        1.0: 'red'
      }
    });

    // Adicionar ao mapa
    heatLayer.addTo(map);

    // Cleanup: remover layer quando componente desmontar
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points, options]);

  return null; // Componente não renderiza nada visualmente
}
