/**
 * MiniMap - Fase 70.3
 * Componente compacto de mapa para exibir localização única
 * Usado em cards de detalhes de clientes, concorrentes e leads
 */

import { useEffect, useRef, useState } from "react";
import { MapPin, ExternalLink, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "wouter";

interface MiniMapProps {
  latitude?: number | null;
  longitude?: number | null;
  title?: string;
  className?: string;
  height?: number;
  linkToFullMap?: boolean;
}

export default function MiniMap({
  latitude,
  longitude,
  title,
  className = "",
  height = 200,
  linkToFullMap = true,
}: MiniMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const mapInstanceRef = useRef<any>(null);

  // Verificar se há coordenadas válidas
  const hasValidCoordinates =
    latitude !== null &&
    latitude !== undefined &&
    longitude !== null &&
    longitude !== undefined &&
    !isNaN(latitude) &&
    !isNaN(longitude);

  useEffect(() => {
    if (!hasValidCoordinates || !mapRef.current) return;

    // Função para inicializar o mapa
    const initMap = () => {
      if (!(window as any).google || !(window as any).google.maps) {
        setMapError(true);
        return;
      }

      try {
        const center = { lat: latitude!, lng: longitude! };

        // Criar mapa
        const map = new (window as any).google.maps.Map(mapRef.current!, {
          center,
          zoom: 14,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "cooperative",
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        });

        // Adicionar marcador
        new (window as any).google.maps.Marker({
          position: center,
          map,
          title: title || "Localização",
          icon: {
            path: (window as any).google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#3b82f6",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
        });

        mapInstanceRef.current = map;
        setMapLoaded(true);
      } catch (error) {
        console.error("Erro ao inicializar mini-mapa:", error);
        setMapError(true);
      }
    };

    // Aguardar carregamento do Google Maps API
    if ((window as any).google && (window as any).google.maps) {
      initMap();
    } else {
      // Aguardar evento de carregamento
      const checkInterval = setInterval(() => {
        if ((window as any).google && (window as any).google.maps) {
          clearInterval(checkInterval);
          initMap();
        }
      }, 100);

      // Timeout de 5 segundos
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!mapLoaded) {
          setMapError(true);
        }
      }, 5000);

      return () => clearInterval(checkInterval);
    }
  }, [latitude, longitude, hasValidCoordinates, title, mapLoaded]);

  // Fallback quando não há coordenadas
  if (!hasValidCoordinates) {
    return (
      <Card
        className={`flex items-center justify-center bg-muted/30 ${className}`}
        style={{ height }}
      >
        <div className="text-center text-muted-foreground p-4">
          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Localização não disponível</p>
        </div>
      </Card>
    );
  }

  // Fallback quando há erro
  if (mapError) {
    return (
      <Card
        className={`flex items-center justify-center bg-muted/30 ${className}`}
        style={{ height }}
      >
        <div className="text-center text-muted-foreground p-4">
          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Erro ao carregar mapa</p>
          <p className="text-xs mt-1">
            {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
          </p>
        </div>
      </Card>
    );
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
      {!mapLoaded && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg"
          style={{ height }}
        >
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {/* Botão de Link para Mapa Completo */}
      {linkToFullMap && mapLoaded && (
        <div className="absolute top-2 right-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/geocockpit">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0 shadow-md"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ver no mapa completo</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Coordenadas (opcional) */}
      {mapLoaded && (
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-muted-foreground shadow-sm">
          {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </div>
      )}
    </div>
  );
}
