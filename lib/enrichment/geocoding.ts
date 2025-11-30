/**
 * Geocodificação Automática
 *
 * Converte cidade + UF em coordenadas geográficas (lat/lng)
 * usando Google Maps Geocoding API
 */

export interface Coordenadas {
  lat: number;
  lng: number;
}

/**
 * Geocodificar endereço (cidade + UF)
 *
 * @param cidade - Nome da cidade (ex: "São Paulo")
 * @param uf - Sigla do estado (ex: "SP")
 * @returns Coordenadas {lat, lng} ou null se não encontrar
 */
export async function geocodificar(cidade: string, uf: string): Promise<Coordenadas | null> {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.warn('[Geocoding] Google Maps API key not configured');
      return null;
    }

    const address = `${cidade}, ${uf}, Brasil`;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      console.log(`[Geocoding] ✅ ${cidade}, ${uf} → ${location.lat}, ${location.lng}`);
      return {
        lat: location.lat,
        lng: location.lng,
      };
    }

    console.warn(`[Geocoding] ⚠️ Não encontrado: ${cidade}, ${uf} (status: ${data.status})`);
    return null;
  } catch (error) {
    console.error('[Geocoding] ❌ Erro:', error);
    return null;
  }
}
