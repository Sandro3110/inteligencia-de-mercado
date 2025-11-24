/**
 * EntityMarker Component
 * Unified entity marker
 * Supports markets, clients, products, competitors and leads
 */

'use client';

import { useMemo, useCallback } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L, { DivIcon } from 'leaflet';
import { Building, Users, Package, Target, Sparkles, type LucideIcon } from 'lucide-react';
import { renderToString } from 'react-dom/server';

// ============================================================================
// TYPES
// ============================================================================

export type EntityType = 'mercado' | 'cliente' | 'produto' | 'concorrente' | 'lead';

export interface EntityMarkerProps {
  position: [number, number];
  type: EntityType;
  nome: string;
  qualidadeScore?: number;
  onClick?: () => void;
  children?: React.ReactNode;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ENTITY_COLORS: Record<EntityType, string> = {
  mercado: '#3b82f6', // blue-500
  cliente: '#10b981', // green-500
  produto: '#eab308', // yellow-500
  concorrente: '#ef4444', // red-500
  lead: '#a855f7', // purple-500
} as const;

const ENTITY_ICONS: Record<EntityType, LucideIcon> = {
  mercado: Building,
  cliente: Users,
  produto: Package,
  concorrente: Target,
  lead: Sparkles,
} as const;

const QUALITY_COLORS = {
  HIGH: '#10b981', // green-500
  MEDIUM: '#eab308', // yellow-500
  LOW: '#ef4444', // red-500
} as const;

const QUALITY_THRESHOLDS = {
  HIGH: 70,
  MEDIUM: 40,
} as const;

const SIZE_CONFIG = {
  BASE: 32,
  HIGH: 40,
  LOW: 28,
  BADGE: 16,
  ICON_SCALE: 0.5,
} as const;

const STYLE_VALUES = {
  BORDER_WIDTH: 3,
  BORDER_COLOR: 'white',
  BORDER_RADIUS: '50%',
  SHADOW: '0 2px 8px rgba(0,0,0,0.3)',
  BADGE_BORDER_WIDTH: 2,
  BADGE_FONT_SIZE: 10,
  BADGE_TOP: -4,
  BADGE_RIGHT: -4,
  TRANSFORM_SCALE: 'scale(1.1)',
  TRANSFORM_NORMAL: 'scale(1)',
} as const;

const CLASSES = {
  MARKER: 'entity-marker',
  MARKER_CONTAINER: 'custom-entity-marker',
  POPUP_CONTENT: 'space-y-2 min-w-[200px]',
  POPUP_TITLE: 'font-semibold text-sm',
} as const;

const CSS_PROPERTIES = {
  POSITION_RELATIVE: 'relative',
  POSITION_ABSOLUTE: 'absolute',
  DISPLAY_FLEX: 'flex',
  ALIGN_CENTER: 'center',
  JUSTIFY_CENTER: 'center',
  CURSOR_POINTER: 'pointer',
  TRANSITION: 'transform 0.2s',
  COLOR_WHITE: 'white',
  FONT_WEIGHT_BOLD: 'bold',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Determine color based on quality score
 */
function getQualityColor(score: number): string {
  if (score >= QUALITY_THRESHOLDS.HIGH) return QUALITY_COLORS.HIGH;
  if (score >= QUALITY_THRESHOLDS.MEDIUM) return QUALITY_COLORS.MEDIUM;
  return QUALITY_COLORS.LOW;
}

/**
 * Determine marker size based on quality
 */
function getMarkerSize(qualidadeScore?: number): number {
  if (!qualidadeScore) return SIZE_CONFIG.BASE;
  if (qualidadeScore >= QUALITY_THRESHOLDS.HIGH) return SIZE_CONFIG.HIGH;
  if (qualidadeScore < QUALITY_THRESHOLDS.MEDIUM) return SIZE_CONFIG.LOW;
  return SIZE_CONFIG.BASE;
}

/**
 * Get icon size based on marker size
 */
function getIconSize(markerSize: number): number {
  return markerSize * SIZE_CONFIG.ICON_SCALE;
}

/**
 * Create quality badge HTML
 */
function createQualityBadgeHtml(qualidadeScore: number): string {
  return `<div style="
    position: ${CSS_PROPERTIES.POSITION_ABSOLUTE};
    top: ${STYLE_VALUES.BADGE_TOP}px;
    right: ${STYLE_VALUES.BADGE_RIGHT}px;
    background: ${getQualityColor(qualidadeScore)};
    color: ${CSS_PROPERTIES.COLOR_WHITE};
    border-radius: ${STYLE_VALUES.BORDER_RADIUS};
    width: ${SIZE_CONFIG.BADGE}px;
    height: ${SIZE_CONFIG.BADGE}px;
    display: ${CSS_PROPERTIES.DISPLAY_FLEX};
    align-items: ${CSS_PROPERTIES.ALIGN_CENTER};
    justify-content: ${CSS_PROPERTIES.JUSTIFY_CENTER};
    font-size: ${STYLE_VALUES.BADGE_FONT_SIZE}px;
    font-weight: ${CSS_PROPERTIES.FONT_WEIGHT_BOLD};
    border: ${STYLE_VALUES.BADGE_BORDER_WIDTH}px solid ${STYLE_VALUES.BORDER_COLOR};
  ">${qualidadeScore}</div>`;
}

/**
 * Create marker container HTML
 */
function createMarkerHtml(
  size: number,
  color: string,
  iconHtml: string,
  qualityBadgeHtml: string
): string {
  return `
    <div style="
      position: ${CSS_PROPERTIES.POSITION_RELATIVE};
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: ${STYLE_VALUES.BORDER_RADIUS};
      display: ${CSS_PROPERTIES.DISPLAY_FLEX};
      align-items: ${CSS_PROPERTIES.ALIGN_CENTER};
      justify-content: ${CSS_PROPERTIES.JUSTIFY_CENTER};
      box-shadow: ${STYLE_VALUES.SHADOW};
      border: ${STYLE_VALUES.BORDER_WIDTH}px solid ${STYLE_VALUES.BORDER_COLOR};
      cursor: ${CSS_PROPERTIES.CURSOR_POINTER};
      transition: ${CSS_PROPERTIES.TRANSITION};
    " class="${CLASSES.MARKER}" onmouseover="this.style.transform='${STYLE_VALUES.TRANSFORM_SCALE}'" onmouseout="this.style.transform='${STYLE_VALUES.TRANSFORM_NORMAL}'">
      ${iconHtml}
      ${qualityBadgeHtml}
    </div>
  `;
}

/**
 * Create custom icon based on entity type
 */
function createEntityIcon(type: EntityType, qualidadeScore?: number): DivIcon {
  const Icon = ENTITY_ICONS[type];
  const color = ENTITY_COLORS[type];
  const size = getMarkerSize(qualidadeScore);
  const iconSize = getIconSize(size);

  // Add quality badge if available
  const qualityBadgeHtml = qualidadeScore ? createQualityBadgeHtml(qualidadeScore) : '';

  // Render icon
  const iconHtml = renderToString(<Icon size={iconSize} color={CSS_PROPERTIES.COLOR_WHITE} />);

  // Create complete marker HTML
  const markerHtml = createMarkerHtml(size, color, iconHtml, qualityBadgeHtml);

  return L.divIcon({
    html: markerHtml,
    className: CLASSES.MARKER_CONTAINER,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Unified marker component for all entity types
 */
export default function EntityMarker({
  position,
  type,
  nome,
  qualidadeScore,
  onClick,
  children,
}: EntityMarkerProps) {
  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const icon = useMemo(() => createEntityIcon(type, qualidadeScore), [type, qualidadeScore]);

  const eventHandlers = useMemo(
    () => ({
      click: handleClick,
    }),
    [handleClick]
  );

  const hasPopup = useMemo(() => Boolean(children), [children]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Marker position={position} icon={icon} eventHandlers={eventHandlers}>
      {hasPopup && (
        <Popup>
          <div className={CLASSES.POPUP_CONTENT}>
            <h3 className={CLASSES.POPUP_TITLE}>{nome}</h3>
            {children}
          </div>
        </Popup>
      )}
    </Marker>
  );
}
