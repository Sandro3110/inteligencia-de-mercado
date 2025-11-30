'use client';

import { useEffect, useRef } from 'react';

interface MapViewProps {
  center: { lat: number; lng: number };
  zoom?: number;
  onMapReady?: (map: google.maps.Map, google: typeof google.maps) => void;
}

export function MapView({ center, zoom = 10, onMapReady }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Carregar Google Maps API via script
    const loadGoogleMaps = () => {
      // Verificar se já está carregado
      if (window.google && window.google.maps) {
        initMap();
        return;
      }

      // Criar script tag
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDummy&libraries=visualization,places,geometry,drawing`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapRef.current || !window.google) return;

      const mapOptions: google.maps.MapOptions = {
        center,
        zoom,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
      };

      const map = new google.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = map;

      // Callback quando o mapa está pronto
      if (onMapReady) {
        onMapReady(map, google.maps);
      }
    };

    loadGoogleMaps();

    // Cleanup
    return () => {
      mapInstanceRef.current = null;
    };
  }, [center, zoom, onMapReady]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
}
