'use client';

/**
 * Componente Base de Mapa usando Leaflet
 *
 * Wrapper do react-leaflet com configurações padrão para o Brasil
 */

import { ReactNode } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para ícones do Leaflet no Vite
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Configurar ícone padrão do Leaflet
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41] as [number, number],
  iconAnchor: [12, 41] as [number, number],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapContainerProps {
  /** Centro do mapa [latitude, longitude] */
  center?: [number, number];
  /** Nível de zoom inicial (1-18) */
  zoom?: number;
  /** Altura do mapa */
  height?: string;
  /** Largura do mapa */
  width?: string;
  /** Elementos filhos (marcadores, layers, etc) */
  children?: ReactNode;
  /** Classe CSS adicional */
  className?: string;
}

// Centro geográfico do Brasil
const BRAZIL_CENTER: [number, number] = [-14.235, -51.925];

const DEFAULT_CONFIG = {
  zoom: 4,
  height: '100%',
  width: '100%',
  maxZoom: 18,
  borderRadius: '0.5rem',
} as const;

const TILE_LAYER = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
} as const;

/**
 * Componente de mapa base com configurações padrão para o Brasil
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
  zoom = DEFAULT_CONFIG.zoom,
  height = DEFAULT_CONFIG.height,
  width = DEFAULT_CONFIG.width,
  children,
  className = '',
}: MapContainerProps) {
  return (
    <div style={{ height, width }} className={className}>
      <LeafletMapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', borderRadius: DEFAULT_CONFIG.borderRadius }}
        scrollWheelZoom={true}
        zoomControl={true}
        attributionControl={true}
      >
        {/* Tile Layer - OpenStreetMap */}
        <TileLayer
          url={TILE_LAYER.url}
          attribution={TILE_LAYER.attribution}
          maxZoom={DEFAULT_CONFIG.maxZoom}
        />

        {children}
      </LeafletMapContainer>
    </div>
  );
}
