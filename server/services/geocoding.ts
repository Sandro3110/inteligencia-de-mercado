/**
 * Serviço de Geocodificação com Google Maps API
 * 
 * Usado como fallback para enriquecer registros sem coordenadas
 * que não foram obtidas via OpenAI durante o enriquecimento.
 */

import { toMySQLTimestamp } from '../_core/dateUtils';

// Interface para resultado de geocodificação
export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  placeId?: string;
  confidence: 'high' | 'medium' | 'low';
}

// Interface para erro de geocodificação
export interface GeocodeError {
  success: false;
  error: string;
  details?: string;
}

// Cache em memória para evitar chamadas duplicadas
const geocodeCache = new Map<string, GeocodeResult>();

// Validação de coordenadas do Brasil
function isValidBrazilCoordinates(lat: number, lng: number): boolean {
  // Range aproximado do Brasil: lat -33 a 5, lng -73 a -34
  return lat >= -33 && lat <= 5 && lng >= -73 && lng <= -34;
}

/**
 * Geocodifica um endereço usando Google Maps Geocoding API
 * 
 * @param cidade - Nome da cidade
 * @param uf - Sigla do estado (ex: SP, RJ)
 * @param pais - País (padrão: Brasil)
 * @param apiKey - Chave da API do Google Maps
 * @returns Resultado da geocodificação ou erro
 */
export async function geocodeAddress(
  cidade: string,
  uf: string,
  pais: string = 'Brasil',
  apiKey: string
): Promise<GeocodeResult | GeocodeError> {
  try {
    // Validar inputs
    if (!cidade || !uf) {
      return {
        success: false,
        error: 'Cidade e UF são obrigatórios',
      };
    }

    if (!apiKey) {
      return {
        success: false,
        error: 'API Key do Google Maps não configurada',
      };
    }

    // Verificar cache
    const cacheKey = `${cidade.toLowerCase()}-${uf.toLowerCase()}-${pais.toLowerCase()}`;
    if (geocodeCache.has(cacheKey)) {
      console.log(`[Geocoding] Cache HIT: ${cacheKey}`);
      return geocodeCache.get(cacheKey)!;
    }

    // Montar endereço para busca
    const address = `${cidade}, ${uf}, ${pais}`;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    console.log(`[Geocoding] Buscando coordenadas para: ${address}`);

    // Fazer requisição à API
    const response = await fetch(url);
    const data = await response.json();

    // Verificar status da resposta
    if (data.status !== 'OK') {
      console.error(`[Geocoding] Erro na API: ${data.status}`, data.error_message);
      return {
        success: false,
        error: `Erro na API do Google Maps: ${data.status}`,
        details: data.error_message,
      };
    }

    // Verificar se há resultados
    if (!data.results || data.results.length === 0) {
      return {
        success: false,
        error: 'Nenhum resultado encontrado para o endereço',
      };
    }

    // Pegar primeiro resultado
    const result = data.results[0];
    const location = result.geometry.location;
    const latitude = location.lat;
    const longitude = location.lng;

    // Validar coordenadas
    if (!isValidBrazilCoordinates(latitude, longitude)) {
      console.warn(`[Geocoding] Coordenadas fora do Brasil: ${latitude}, ${longitude}`);
      return {
        success: false,
        error: 'Coordenadas fora do território brasileiro',
      };
    }

    // Determinar nível de confiança baseado no tipo de resultado
    let confidence: 'high' | 'medium' | 'low' = 'medium';
    const locationType = result.geometry.location_type;
    
    if (locationType === 'ROOFTOP') {
      confidence = 'high';
    } else if (locationType === 'RANGE_INTERPOLATED' || locationType === 'GEOMETRIC_CENTER') {
      confidence = 'medium';
    } else {
      confidence = 'low';
    }

    // Montar resultado
    const geocodeResult: GeocodeResult = {
      latitude,
      longitude,
      formattedAddress: result.formatted_address,
      placeId: result.place_id,
      confidence,
    };

    // Salvar no cache
    geocodeCache.set(cacheKey, geocodeResult);
    console.log(`[Geocoding] Sucesso: ${latitude}, ${longitude} (${confidence})`);

    return geocodeResult;

  } catch (error) {
    console.error('[Geocoding] Erro ao geocodificar:', error);
    return {
      success: false,
      error: 'Erro ao conectar com a API do Google Maps',
      details: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Geocodifica múltiplos endereços em lote
 * 
 * @param addresses - Array de objetos com cidade, uf e id
 * @param apiKey - Chave da API do Google Maps
 * @param delayMs - Delay entre requisições (padrão: 200ms para evitar rate limiting)
 * @returns Array de resultados com id e coordenadas
 */
export async function geocodeBatch(
  addresses: Array<{ id: number; cidade: string; uf: string; tipo: 'cliente' | 'concorrente' | 'lead' }>,
  apiKey: string,
  delayMs: number = 200
): Promise<Array<{ id: number; tipo: string; result: GeocodeResult | GeocodeError }>> {
  const results: Array<{ id: number; tipo: string; result: GeocodeResult | GeocodeError }> = [];

  console.log(`[Geocoding] Iniciando geocodificação em lote de ${addresses.length} endereços`);

  for (const address of addresses) {
    const result = await geocodeAddress(address.cidade, address.uf, 'Brasil', apiKey);
    
    results.push({
      id: address.id,
      tipo: address.tipo,
      result,
    });

    // Delay para evitar rate limiting
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  const successCount = results.filter(r => 'latitude' in r.result).length;
  console.log(`[Geocoding] Lote concluído: ${successCount}/${addresses.length} sucessos`);

  return results;
}

/**
 * Testa a conexão com a API do Google Maps
 * 
 * @param apiKey - Chave da API do Google Maps
 * @returns true se a conexão foi bem-sucedida
 */
export async function testGoogleMapsConnection(apiKey: string): Promise<{ success: boolean; message: string }> {
  try {
    // Testar com um endereço conhecido
    const result = await geocodeAddress('São Paulo', 'SP', 'Brasil', apiKey);

    if ('latitude' in result) {
      return {
        success: true,
        message: 'Conexão com Google Maps API estabelecida com sucesso',
      };
    } else {
      return {
        success: false,
        message: result.error,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Limpa o cache de geocodificação
 */
export function clearGeocodeCache(): void {
  geocodeCache.clear();
  console.log('[Geocoding] Cache limpo');
}
