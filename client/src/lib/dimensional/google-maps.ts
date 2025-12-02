/**
 * Helper do Google Maps
 * 100% Funcional
 */

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// ============================================================================
// CARREGAR GOOGLE MAPS SCRIPT
// ============================================================================

let googleMapsPromise: Promise<typeof google> | null = null;

export async function carregarGoogleMaps(): Promise<typeof google> {
  // Se já foi carregado, retornar
  if (window.google?.maps) {
    return window.google;
  }

  // Se está carregando, aguardar
  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  // Carregar script
  googleMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry,drawing,visualization`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google?.maps) {
        resolve(window.google);
      } else {
        reject(new Error('Google Maps não carregou corretamente'));
      }
    };

    script.onerror = () => {
      reject(new Error('Erro ao carregar Google Maps'));
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

// ============================================================================
// CRIAR MAPA
// ============================================================================

export interface MapaConfig {
  elementoId: string;
  centro: {
    latitude: number;
    longitude: number;
  };
  zoom: number;
  estilo?: google.maps.MapTypeStyle[];
}

export async function criarMapa(config: MapaConfig): Promise<google.maps.Map> {
  const google = await carregarGoogleMaps();

  const elemento = document.getElementById(config.elementoId);
  if (!elemento) {
    throw new Error(`Elemento #${config.elementoId} não encontrado`);
  }

  const mapa = new google.maps.Map(elemento, {
    center: {
      lat: config.centro.latitude,
      lng: config.centro.longitude
    },
    zoom: config.zoom,
    styles: config.estilo,
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: true,
    zoomControl: true
  });

  return mapa;
}

// ============================================================================
// CRIAR MARCADOR
// ============================================================================

export interface MarcadorConfig {
  mapa: google.maps.Map;
  posicao: {
    latitude: number;
    longitude: number;
  };
  titulo?: string;
  icone?: string | google.maps.Icon;
  onClick?: () => void;
}

export async function criarMarcador(config: MarcadorConfig): Promise<google.maps.Marker> {
  const google = await carregarGoogleMaps();

  const marcador = new google.maps.Marker({
    map: config.mapa,
    position: {
      lat: config.posicao.latitude,
      lng: config.posicao.longitude
    },
    title: config.titulo,
    icon: config.icone
  });

  if (config.onClick) {
    marcador.addListener('click', config.onClick);
  }

  return marcador;
}

// ============================================================================
// CRIAR CLUSTER
// ============================================================================

export interface ClusterConfig {
  mapa: google.maps.Map;
  marcadores: google.maps.Marker[];
  estilos?: any[];
}

export async function criarCluster(config: ClusterConfig): Promise<any> {
  // Importar MarkerClusterer
  const { MarkerClusterer } = await import('@googlemaps/markerclusterer');

  const cluster = new MarkerClusterer({
    map: config.mapa,
    markers: config.marcadores
  });

  return cluster;
}

// ============================================================================
// CRIAR HEATMAP
// ============================================================================

export interface HeatmapConfig {
  mapa: google.maps.Map;
  pontos: {
    latitude: number;
    longitude: number;
    peso?: number;
  }[];
  raio?: number;
  opacidade?: number;
  gradiente?: string[];
}

export async function criarHeatmap(config: HeatmapConfig): Promise<google.maps.visualization.HeatmapLayer> {
  const google = await carregarGoogleMaps();

  const pontos = config.pontos.map(ponto => ({
    location: new google.maps.LatLng(ponto.latitude, ponto.longitude),
    weight: ponto.peso || 1
  }));

  const heatmap = new google.maps.visualization.HeatmapLayer({
    data: pontos,
    map: config.mapa,
    radius: config.raio || 20,
    opacity: config.opacidade || 0.6,
    gradient: config.gradiente
  });

  return heatmap;
}

// ============================================================================
// CRIAR INFO WINDOW
// ============================================================================

export interface InfoWindowConfig {
  mapa: google.maps.Map;
  marcador: google.maps.Marker;
  conteudo: string | HTMLElement;
}

export async function criarInfoWindow(config: InfoWindowConfig): Promise<google.maps.InfoWindow> {
  const google = await carregarGoogleMaps();

  const infoWindow = new google.maps.InfoWindow({
    content: config.conteudo
  });

  config.marcador.addListener('click', () => {
    infoWindow.open(config.mapa, config.marcador);
  });

  return infoWindow;
}

// ============================================================================
// GEOCODIFICAÇÃO
// ============================================================================

export async function geocodificar(endereco: string): Promise<{
  latitude: number;
  longitude: number;
  enderecoFormatado: string;
} | null> {
  const google = await carregarGoogleMaps();

  const geocoder = new google.maps.Geocoder();

  return new Promise((resolve) => {
    geocoder.geocode({ address: endereco }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        resolve({
          latitude: location.lat(),
          longitude: location.lng(),
          enderecoFormatado: results[0].formatted_address
        });
      } else {
        resolve(null);
      }
    });
  });
}

// ============================================================================
// GEOCODIFICAÇÃO REVERSA
// ============================================================================

export async function geocodificarReverso(latitude: number, longitude: number): Promise<string | null> {
  const google = await carregarGoogleMaps();

  const geocoder = new google.maps.Geocoder();

  return new Promise((resolve) => {
    geocoder.geocode(
      { location: { lat: latitude, lng: longitude } },
      (results, status) => {
        if (status === 'OK' && results && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          resolve(null);
        }
      }
    );
  });
}

// ============================================================================
// CALCULAR DISTÂNCIA
// ============================================================================

export async function calcularDistancia(
  origem: { latitude: number; longitude: number },
  destino: { latitude: number; longitude: number }
): Promise<{
  metros: number;
  quilometros: number;
  textoFormatado: string;
}> {
  const google = await carregarGoogleMaps();

  const pontoOrigem = new google.maps.LatLng(origem.latitude, origem.longitude);
  const pontoDestino = new google.maps.LatLng(destino.latitude, destino.longitude);

  const metros = google.maps.geometry.spherical.computeDistanceBetween(
    pontoOrigem,
    pontoDestino
  );

  const quilometros = metros / 1000;

  let textoFormatado: string;
  if (quilometros < 1) {
    textoFormatado = `${metros.toFixed(0)} m`;
  } else {
    textoFormatado = `${quilometros.toFixed(2)} km`;
  }

  return {
    metros,
    quilometros,
    textoFormatado
  };
}

// ============================================================================
// AJUSTAR BOUNDS
// ============================================================================

export async function ajustarBounds(
  mapa: google.maps.Map,
  pontos: { latitude: number; longitude: number }[]
): Promise<void> {
  const google = await carregarGoogleMaps();

  const bounds = new google.maps.LatLngBounds();

  pontos.forEach(ponto => {
    bounds.extend(new google.maps.LatLng(ponto.latitude, ponto.longitude));
  });

  mapa.fitBounds(bounds);
}

// ============================================================================
// ESTILOS DE MAPA PREDEFINIDOS
// ============================================================================

export const ESTILOS_MAPA = {
  // Estilo padrão (limpo)
  padrao: [],

  // Estilo escuro
  escuro: [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }]
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }]
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#263c3f' }]
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#6b9a76' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#38414e' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#212a37' }]
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9ca5b3' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#746855' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#1f2835' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#f3d19c' }]
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#2f3948' }]
    },
    {
      featureType: 'transit.station',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#17263c' }]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#515c6d' }]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#17263c' }]
    }
  ],

  // Estilo minimalista
  minimalista: [
    {
      featureType: 'all',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'administrative',
      elementType: 'labels',
      stylers: [{ visibility: 'on' }]
    },
    {
      featureType: 'poi',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'road',
      elementType: 'labels',
      stylers: [{ visibility: 'simplified' }]
    }
  ]
};

// ============================================================================
// LIMPEZA DE ELEMENTOS
// ============================================================================

/**
 * Limpar marcadores do mapa
 */
export function limparMarcadores(marcadores: google.maps.Marker[]): void {
  marcadores.forEach(marcador => {
    marcador.setMap(null);
  });
}

/**
 * Limpar cluster do mapa
 */
export function limparCluster(cluster: any): void {
  if (cluster && cluster.clearMarkers) {
    cluster.clearMarkers();
  }
}

/**
 * Limpar heatmap do mapa
 */
export function limparHeatmap(heatmap: google.maps.visualization.HeatmapLayer): void {
  heatmap.setMap(null);
}

/**
 * Limpar todos os elementos do mapa
 */
export function limparMapa(elementos: {
  marcadores?: google.maps.Marker[];
  clusters?: any[];
  heatmaps?: google.maps.visualization.HeatmapLayer[];
}): void {
  if (elementos.marcadores) {
    limparMarcadores(elementos.marcadores);
  }
  if (elementos.clusters) {
    elementos.clusters.forEach(cluster => limparCluster(cluster));
  }
  if (elementos.heatmaps) {
    elementos.heatmaps.forEach(heatmap => limparHeatmap(heatmap));
  }
}

// ============================================================================
// CORES PARA MARCADORES
// ============================================================================

export const CORES_MARCADOR = {
  vermelho: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
  azul: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
  verde: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
  amarelo: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
  roxo: 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png',
  laranja: 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png'
};
