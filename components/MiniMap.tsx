'use client';

/**
 * MiniMap - Fase 70.3
 * Componente compacto de mapa para exibir localização única
 * Usado em cards de detalhes de clientes, concorrentes e leads
 */

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { MapPin, ExternalLink, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Link } from 'wouter';

// ============================================================================
// CONSTANTS
// ============================================================================

const MAP_CONFIG = {
  DEFAULT_ZOOM: 14,
  DISABLE_DEFAULT_UI: true,
  ZOOM_CONTROL: true,
  GESTURE_HANDLING: 'cooperative' as const,
} as const;

const MAP_STYLES = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
];

const MARKER_CONFIG = {
  SCALE: 8,
  FILL_COLOR: '#3b82f6',
  FILL_OPACITY: 1,
  STROKE_COLOR: '#ffffff',
  STROKE_WEIGHT: 2,
} as const;

const TIMING = {
  CHECK_INTERVAL_MS: 100,
  LOAD_TIMEOUT_MS: 5000,
} as const;

const LABELS = {
  DEFAULT_TITLE: 'Localização',
  NO_COORDINATES: 'Localização não disponível',
  LOAD_ERROR: 'Erro ao carregar mapa',
  VIEW_FULL_MAP: 'Ver no mapa completo',
} as const;

const ICON_SIZES = {
  LARGE: 'w-8 h-8',
  MEDIUM: 'w-6 h-6',
  SMALL: 'w-4 h-4',
} as const;

const BUTTON_SIZES = {
  SMALL: 'h-8 w-8',
} as const;

const DEFAULT_HEIGHT = 200;
const COORDINATE_PRECISION = 6;

// ============================================================================
// TYPES
// ============================================================================

interface MiniMapProps {
  latitude?: number | null;
  longitude?: number | null;
  title?: string;
  className?: string;
  height?: number;
  linkToFullMap?: boolean;
}

interface GoogleMapsWindow extends Window {
  google?: {
    maps?: {
      Map: new (element: HTMLElement, options: any) => any;
      Marker: new (options: any) => any;
      SymbolPath: {
        CIRCLE: any;
      };
    };
  };
}

declare const window: GoogleMapsWindow;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isValidCoordinate(value: number | null | undefined): value is number {
  return (
    value !== null && value !== undefined && !isNaN(value) && isFinite(value)
  );
}

function hasValidCoordinates(
  latitude: number | null | undefined,
  longitude: number | null | undefined
): boolean {
  return isValidCoordinate(latitude) && isValidCoordinate(longitude);
}

function formatCoordinate(value: number): string {
  return value.toFixed(COORDINATE_PRECISION);
}

function isGoogleMapsLoaded(): boolean {
  return Boolean(window.google?.maps);
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function MiniMap({
  latitude,
  longitude,
  title,
  className = '',
  height = DEFAULT_HEIGHT,
  linkToFullMap = true,
}: MiniMapProps) {
  // Refs
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // State
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const hasCoordinates = useMemo(
    () => hasValidCoordinates(latitude, longitude),
    [latitude, longitude]
  );

  const coordinatesText = useMemo(() => {
    if (!hasCoordinates || !latitude || !longitude) return '';
    return `${formatCoordinate(latitude)}, ${formatCoordinate(longitude)}`;
  }, [hasCoordinates, latitude, longitude]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const initializeMap = useCallback(() => {
    if (!isGoogleMapsLoaded()) {
      setMapError(true);
      return;
    }

    if (!mapRef.current || !latitude || !longitude) {
      return;
    }

    try {
      const center = { lat: latitude, lng: longitude };

      // Criar mapa
      const map = new window.google!.maps!.Map(mapRef.current, {
        center,
        zoom: MAP_CONFIG.DEFAULT_ZOOM,
        disableDefaultUI: MAP_CONFIG.DISABLE_DEFAULT_UI,
        zoomControl: MAP_CONFIG.ZOOM_CONTROL,
        gestureHandling: MAP_CONFIG.GESTURE_HANDLING,
        styles: MAP_STYLES,
      });

      // Adicionar marcador
      new window.google!.maps!.Marker({
        position: center,
        map,
        title: title || LABELS.DEFAULT_TITLE,
        icon: {
          path: window.google!.maps!.SymbolPath.CIRCLE,
          scale: MARKER_CONFIG.SCALE,
          fillColor: MARKER_CONFIG.FILL_COLOR,
          fillOpacity: MARKER_CONFIG.FILL_OPACITY,
          strokeColor: MARKER_CONFIG.STROKE_COLOR,
          strokeWeight: MARKER_CONFIG.STROKE_WEIGHT,
        },
      });

      mapInstanceRef.current = map;
      setMapLoaded(true);
    } catch (error) {
      console.error('Erro ao inicializar mini-mapa:', error);
      setMapError(true);
    }
  }, [latitude, longitude, title]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (!hasCoordinates || !mapRef.current) return;

    // Aguardar carregamento do Google Maps API
    if (isGoogleMapsLoaded()) {
      initializeMap();
    } else {
      // Aguardar evento de carregamento
      const checkInterval = setInterval(() => {
        if (isGoogleMapsLoaded()) {
          clearInterval(checkInterval);
          initializeMap();
        }
      }, TIMING.CHECK_INTERVAL_MS);

      // Timeout
      const timeout = setTimeout(() => {
        clearInterval(checkInterval);
        if (!mapLoaded) {
          setMapError(true);
        }
      }, TIMING.LOAD_TIMEOUT_MS);

      return () => {
        clearInterval(checkInterval);
        clearTimeout(timeout);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCoordinates, initializeMap]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderNoCoordinates = useCallback(
    () => (
      <Card
        className={`flex items-center justify-center bg-muted/30 ${className}`}
        style={{ height }}
      >
        <div className="text-center text-muted-foreground p-4">
          <MapPin className={`${ICON_SIZES.LARGE} mx-auto mb-2 opacity-50`} />
          <p className="text-sm">{LABELS.NO_COORDINATES}</p>
        </div>
      </Card>
    ),
    [className, height]
  );

  const renderError = useCallback(
    () => (
      <Card
        className={`flex items-center justify-center bg-muted/30 ${className}`}
        style={{ height }}
      >
        <div className="text-center text-muted-foreground p-4">
          <MapPin className={`${ICON_SIZES.LARGE} mx-auto mb-2 opacity-50`} />
          <p className="text-sm">{LABELS.LOAD_ERROR}</p>
          <p className="text-xs mt-1">{coordinatesText}</p>
        </div>
      </Card>
    ),
    [className, height, coordinatesText]
  );

  const renderLoadingOverlay = useCallback(
    () =>
      !mapLoaded ? (
        <div
          className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg"
          style={{ height }}
        >
          <Loader2 className={`${ICON_SIZES.MEDIUM} animate-spin text-primary`} />
        </div>
      ) : null,
    [mapLoaded, height]
  );

  const renderFullMapButton = useCallback(
    () =>
      linkToFullMap && mapLoaded ? (
        <div className="absolute top-2 right-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/geocockpit">
                <Button
                  size="sm"
                  variant="secondary"
                  className={`${BUTTON_SIZES.SMALL} p-0 shadow-md`}
                >
                  <ExternalLink className={ICON_SIZES.SMALL} />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>{LABELS.VIEW_FULL_MAP}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      ) : null,
    [linkToFullMap, mapLoaded]
  );

  const renderCoordinates = useCallback(
    () =>
      mapLoaded ? (
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-muted-foreground shadow-sm">
          {coordinatesText}
        </div>
      ) : null,
    [mapLoaded, coordinatesText]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  // Fallback quando não há coordenadas
  if (!hasCoordinates) {
    return renderNoCoordinates();
  }

  // Fallback quando há erro
  if (mapError) {
    return renderError();
  }

  return (
    <div className={`relative ${className}`}>
      {/* Container do Mapa */}
      <div
        ref={mapRef}
        className="w-full rounded-lg overflow-hidden border border-border"
        style={{ height }}
      />

      {/* Loading Overlay */}
      {renderLoadingOverlay()}

      {/* Botão de Link para Mapa Completo */}
      {renderFullMapButton()}

      {/* Coordenadas */}
      {renderCoordinates()}
    </div>
  );
}
