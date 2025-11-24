'use client';

/**
 * Componente de Marcador Personalizado
 *
 * Marcadores customizados por tipo (cliente, concorrente, lead)
 */

import { Marker, Popup } from 'react-leaflet';
import L, { DivIcon } from 'leaflet';
import { Building2, Users, Target, type LucideIcon } from 'lucide-react';
import { renderToString } from 'react-dom/server';

export type MarkerType = 'cliente' | 'concorrente' | 'lead';

interface CustomMarkerProps {
  /** Posição [latitude, longitude] */
  position: [number, number];
  /** Tipo do marcador */
  type: MarkerType;
  /** Título exibido no popup */
  title: string;
  /** Conteúdo adicional do popup */
  children?: React.ReactNode;
  /** Callback ao clicar no marcador */
  onClick?: () => void;
}

const MARKER_ICONS: Record<MarkerType, LucideIcon> = {
  cliente: Building2,
  concorrente: Users,
  lead: Target,
};

const ICON_CONFIG = {
  size: [32, 32] as [number, number],
  anchor: [16, 16] as [number, number],
  popupAnchor: [0, -16] as [number, number],
  iconSize: 18,
} as const;

/**
 * Cria ícone customizado baseado no tipo
 */
function createCustomIcon(type: MarkerType): DivIcon {
  const Icon = MARKER_ICONS[type];

  const iconHtml = renderToString(
    <div className={`custom-marker-icon marker-${type}`}>
      <Icon size={ICON_CONFIG.iconSize} />
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: ICON_CONFIG.size,
    iconAnchor: ICON_CONFIG.anchor,
    popupAnchor: ICON_CONFIG.popupAnchor,
  });
}

/**
 * Marcador customizado com ícones por tipo
 *
 * @example
 * ```tsx
 * <MapContainer>
 *   <CustomMarker
 *     position={[-23.55, -46.63]}
 *     type="cliente"
 *     title="Empresa XYZ"
 *   >
 *     <p>Cidade: São Paulo</p>
 *     <p>Qualidade: 85</p>
 *   </CustomMarker>
 * </MapContainer>
 * ```
 */
export default function CustomMarker({
  position,
  type,
  title,
  children,
  onClick,
}: CustomMarkerProps) {
  const icon = createCustomIcon(type);

  return (
    <Marker
      position={position}
      icon={icon}
      eventHandlers={{
        click: () => onClick?.(),
      }}
    >
      <Popup>
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">{title}</h3>
          {children}
        </div>
      </Popup>
    </Marker>
  );
}
