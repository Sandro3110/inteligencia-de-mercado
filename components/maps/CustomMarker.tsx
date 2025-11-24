/**
 * CustomMarker Component
 * Custom marker with type-specific icons
 * Displays customized markers by type (client, competitor, lead)
 */

'use client';

import { useMemo, useCallback } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L, { DivIcon } from 'leaflet';
import { Building2, Users, Target, type LucideIcon } from 'lucide-react';
import { renderToString } from 'react-dom/server';

// ============================================================================
// TYPES
// ============================================================================

export type MarkerType = 'cliente' | 'concorrente' | 'lead';

interface CustomMarkerProps {
  /** Position [latitude, longitude] */
  position: [number, number];
  /** Marker type */
  type: MarkerType;
  /** Title displayed in popup */
  title: string;
  /** Additional popup content */
  children?: React.ReactNode;
  /** Callback when marker is clicked */
  onClick?: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MARKER_ICONS: Record<MarkerType, LucideIcon> = {
  cliente: Building2,
  concorrente: Users,
  lead: Target,
} as const;

const ICON_CONFIG = {
  SIZE: [32, 32] as [number, number],
  ANCHOR: [16, 16] as [number, number],
  POPUP_ANCHOR: [0, -16] as [number, number],
  ICON_SIZE: 18,
} as const;

const CLASSES = {
  MARKER_BASE: 'custom-marker-icon',
  MARKER_CONTAINER: 'custom-marker',
  POPUP_CONTENT: 'space-y-2',
  POPUP_TITLE: 'font-semibold text-sm',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get marker class name based on type
 */
function getMarkerClassName(type: MarkerType): string {
  return `${CLASSES.MARKER_BASE} marker-${type}`;
}

/**
 * Create custom icon based on marker type
 */
function createCustomIcon(type: MarkerType): DivIcon {
  const Icon = MARKER_ICONS[type];

  const iconHtml = renderToString(
    <div className={getMarkerClassName(type)}>
      <Icon size={ICON_CONFIG.ICON_SIZE} />
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: CLASSES.MARKER_CONTAINER,
    iconSize: ICON_CONFIG.SIZE,
    iconAnchor: ICON_CONFIG.ANCHOR,
    popupAnchor: ICON_CONFIG.POPUP_ANCHOR,
  });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Custom marker with type-specific icons for map display
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
  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const icon = useMemo(() => createCustomIcon(type), [type]);

  const eventHandlers = useMemo(
    () => ({
      click: handleClick,
    }),
    [handleClick]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Marker position={position} icon={icon} eventHandlers={eventHandlers}>
      <Popup>
        <div className={CLASSES.POPUP_CONTENT}>
          <h3 className={CLASSES.POPUP_TITLE}>{title}</h3>
          {children}
        </div>
      </Popup>
    </Marker>
  );
}
