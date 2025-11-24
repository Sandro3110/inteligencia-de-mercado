/**
 * HeatmapLayer Component
 * Heatmap layer for Leaflet maps
 * Uses leaflet.heat to create density visualization
 */

'use client';

import { useEffect, useMemo, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

// ============================================================================
// TYPES
// ============================================================================

export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity?: number;
}

interface HeatmapOptions {
  /** Radius of each point in pixels (default: 25) */
  radius?: number;
  /** Amount of blur (default: 15) */
  blur?: number;
  /** Maximum zoom where heatmap is visible (default: 17) */
  maxZoom?: number;
  /** Maximum intensity (default: 1.0) */
  max?: number;
  /** Custom color gradient */
  gradient?: Record<number, string>;
}

interface HeatmapLayerProps {
  /** Array of points [lat, lng, intensity] */
  points: HeatmapPoint[];
  /** Heatmap configuration options */
  options?: HeatmapOptions;
}

type HeatPoint = [number, number, number];

// Extend Leaflet type to include heatLayer
declare module 'leaflet' {
  function heatLayer(latlngs: HeatPoint[], options?: HeatmapOptions): L.Layer;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_GRADIENT: Record<number, string> = {
  0.0: 'blue',
  0.5: 'lime',
  0.7: 'yellow',
  0.9: 'orange',
  1.0: 'red',
} as const;

const DEFAULT_OPTIONS = {
  RADIUS: 25,
  BLUR: 15,
  MAX_ZOOM: 17,
  MAX_INTENSITY: 1.0,
} as const;

const DEFAULT_INTENSITY = 1.0;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert HeatmapPoint to heat point tuple
 */
function convertToHeatPoint(point: HeatmapPoint): HeatPoint {
  return [point.lat, point.lng, point.intensity ?? DEFAULT_INTENSITY];
}

/**
 * Convert array of HeatmapPoints to heat points array
 */
function convertToHeatPoints(points: HeatmapPoint[]): HeatPoint[] {
  if (!points || points.length === 0) {
    return [];
  }
  return points.map(convertToHeatPoint);
}

/**
 * Get heatmap options with defaults
 */
function getHeatmapOptions(options: HeatmapOptions = {}): Required<HeatmapOptions> {
  return {
    radius: options.radius ?? DEFAULT_OPTIONS.RADIUS,
    blur: options.blur ?? DEFAULT_OPTIONS.BLUR,
    maxZoom: options.maxZoom ?? DEFAULT_OPTIONS.MAX_ZOOM,
    max: options.max ?? DEFAULT_OPTIONS.MAX_INTENSITY,
    gradient: options.gradient ?? DEFAULT_GRADIENT,
  };
}

/**
 * Check if points array is empty
 */
function isEmptyPoints(points: HeatPoint[]): boolean {
  return points.length === 0;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Heatmap layer for density visualization on maps
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

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const heatPoints = useMemo(() => convertToHeatPoints(points), [points]);

  const heatmapOptions = useMemo(() => getHeatmapOptions(options), [options]);

  const isEmpty = useMemo(() => isEmptyPoints(heatPoints), [heatPoints]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    // Skip if no points
    if (isEmpty) {
      return;
    }

    // Create heatmap layer
    const heatLayer = (L as typeof L & { heatLayer: typeof L.heatLayer }).heatLayer(
      heatPoints,
      heatmapOptions
    );

    // Add to map
    heatLayer.addTo(map);

    // Cleanup: remove layer when component unmounts
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, heatPoints, heatmapOptions, isEmpty]);

  // Component does not render anything visually
  return null;
}
