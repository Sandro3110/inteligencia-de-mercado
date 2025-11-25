/**
 * MapContainer Component
 * Base map component using Leaflet
 * Wrapper for react-leaflet with default configurations for Brazil
 */

'use client';

import { ReactNode, useMemo } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet icon images
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// ============================================================================
// LEAFLET ICON CONFIGURATION
// ============================================================================

// Configure default Leaflet icon (fix for Vite)
const DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41] as [number, number],
  iconAnchor: [12, 41] as [number, number],
});

L.Marker.prototype.options.icon = DefaultIcon;

// ============================================================================
// TYPES
// ============================================================================

interface MapContainerProps {
  /** Map center [latitude, longitude] */
  center?: [number, number];
  /** Initial zoom level (1-18) */
  zoom?: number;
  /** Map height */
  height?: string;
  /** Map width */
  width?: string;
  /** Child elements (markers, layers, etc) */
  children?: ReactNode;
  /** Additional CSS class */
  className?: string;
}

interface MapStyle {
  height: string;
  width: string;
}

interface LeafletMapStyle {
  height: string;
  width: string;
  borderRadius: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Geographic center of Brazil
const BRAZIL_CENTER: [number, number] = [-14.235, -51.925];

const DEFAULT_CONFIG = {
  ZOOM: 4,
  HEIGHT: '100%',
  WIDTH: '100%',
  MAX_ZOOM: 18,
  BORDER_RADIUS: '0.5rem',
} as const;

const TILE_LAYER = {
  URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  ATTRIBUTION:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
} as const;

const MAP_FEATURES = {
  SCROLL_WHEEL_ZOOM: true,
  ZOOM_CONTROL: true,
  ATTRIBUTION_CONTROL: true,
} as const;

const STYLE_FULL_SIZE = {
  HEIGHT: '100%',
  WIDTH: '100%',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get container style
 */
function getContainerStyle(height: string, width: string): MapStyle {
  return { height, width };
}

/**
 * Get Leaflet map style
 */
function getLeafletMapStyle(): LeafletMapStyle {
  return {
    height: STYLE_FULL_SIZE.HEIGHT,
    width: STYLE_FULL_SIZE.WIDTH,
    borderRadius: DEFAULT_CONFIG.BORDER_RADIUS,
  };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Base map component with default configurations for Brazil
 *
 * @example
 * ```tsx
 * <MapContainer center={[-14.235, -51.925]} zoom={4}>
 *   <Marker position={[-14.235, -51.925]}>
 *     <Popup>Brasil</Popup>
 *   </Marker>
 * </MapContainer>
 * ```
 */
export default function MapContainer({
  center = BRAZIL_CENTER,
  zoom = DEFAULT_CONFIG.ZOOM,
  height = DEFAULT_CONFIG.HEIGHT,
  width = DEFAULT_CONFIG.WIDTH,
  children,
  className = '',
}: MapContainerProps) {
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const containerStyle = useMemo(() => getContainerStyle(height, width), [height, width]);

  const leafletMapStyle = useMemo(() => getLeafletMapStyle(), []);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div style={containerStyle} className={className}>
      <LeafletMapContainer
        center={center}
        zoom={zoom}
        style={leafletMapStyle}
        scrollWheelZoom={MAP_FEATURES.SCROLL_WHEEL_ZOOM}
        zoomControl={MAP_FEATURES.ZOOM_CONTROL}
        attributionControl={MAP_FEATURES.ATTRIBUTION_CONTROL}
      >
        {/* Tile Layer - OpenStreetMap */}
        <TileLayer
          url={TILE_LAYER.URL}
          attribution={TILE_LAYER.ATTRIBUTION}
          maxZoom={DEFAULT_CONFIG.MAX_ZOOM}
        />

        {children}
      </LeafletMapContainer>
    </div>
  );
}
