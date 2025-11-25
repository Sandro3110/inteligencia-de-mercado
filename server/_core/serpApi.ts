import { logger } from '@/lib/logger';

/**
 * Módulo SerpAPI - Pesquisa Web Real
 * Integração com SerpAPI para buscar dados reais da web
 */

import { ENV } from './env';

const SERPAPI_BASE_URL = 'https://serpapi.com/search';

export interface SerpApiResult {
  position: number;
  title: string;
  link: string;
  snippet: string;
  source?: string;
}

export interface CompanySearchResult {
  nome: string;
  site?: string;
  descricao?: string;
  fonte: string;
}

/**
 * Busca genérica no Google via SerpAPI
 */
export async function searchGoogle(
  query: string,
  options: {
    num?: number;
    location?: string;
    hl?: string;
  } = {}
): Promise<SerpApiResult[]> {
  const apiKey = process.env.SERPAPI_KEY;

  if (!apiKey) {
    console.error('[SerpAPI] SERPAPI_KEY não configurada');
    return [];
  }

  try {
    const params = new URLSearchParams({
      q: query,
      api_key: apiKey,
      engine: 'google',
      num: String(options.num || 10),
      location: options.location || 'Brazil',
      hl: options.hl || 'pt-br',
      gl: 'br',
    });

    const url = `${SERPAPI_BASE_URL}?${params.toString()}`;

    logger.debug(`[SerpAPI] Buscando: "${query}"`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`SerpAPI retornou status ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`SerpAPI erro: ${data.error}`);
    }

    const results: SerpApiResult[] = (data.organic_results || []).map(
      (result: any, index: number) => ({
        position: result.position || index + 1,
        title: result.title || '',
        link: result.link || '',
        snippet: result.snippet || '',
        source: result.source || '',
      })
    );

    logger.debug(`[SerpAPI] Encontrados ${results.length} resultados para "${query}"`);

    return results;
  } catch (error) {
    console.error('[SerpAPI] Erro na busca:', error);
    return [];
  }
}

/**
 * Busca empresas concorrentes
 */
export async function searchCompetitors(
  mercado: string,
  referencia?: string,
  limit: number = 10
): Promise<CompanySearchResult[]> {
  const query = referencia
    ? `concorrentes ${referencia} ${mercado} Brasil`
    : `principais empresas ${mercado} Brasil`;

  const results = await searchGoogle(query, { num: limit });

  return results.map((r) => ({
    nome: extractCompanyName(r.title),
    site: r.link,
    descricao: r.snippet,
    fonte: 'serpapi',
  }));
}

/**
 * Busca leads B2B (fornecedores, parceiros)
 */
export async function searchLeads(
  mercado: string,
  tipo: 'fornecedores' | 'distribuidores' | 'parceiros' = 'fornecedores',
  limit: number = 20
): Promise<CompanySearchResult[]> {
  const query = `${tipo} ${mercado} Brasil empresas`;

  const results = await searchGoogle(query, { num: limit });

  return results.map((r) => ({
    nome: extractCompanyName(r.title),
    site: r.link,
    descricao: r.snippet,
    fonte: 'serpapi',
  }));
}

/**
 * Busca informações sobre uma empresa específica
 */
export async function searchCompanyInfo(nomeEmpresa: string): Promise<{
  site?: string;
  descricao?: string;
  setor?: string;
  localizacao?: string;
} | null> {
  const query = `${nomeEmpresa} Brasil empresa`;

  const results = await searchGoogle(query, { num: 3 });

  if (results.length === 0) return null;

  const firstResult = results[0];

  return {
    site: firstResult.link,
    descricao: firstResult.snippet,
    setor: extractSector(firstResult.snippet),
    localizacao: extractLocation(firstResult.snippet),
  };
}

/**
 * Extrai nome da empresa do título do resultado
 */
function extractCompanyName(title: string): string {
  // Remover sufixos comuns
  let name = title
    .replace(/\s*-\s*.*$/, '') // Remove tudo após " - "
    .replace(/\s*\|.*$/, '') // Remove tudo após " | "
    .replace(/\s*–.*$/, '') // Remove tudo após " – "
    .trim();

  // Limitar tamanho
  if (name.length > 100) {
    name = name.substring(0, 100);
  }

  return name || title.substring(0, 100);
}

/**
 * Extrai setor da descrição
 */
function extractSector(snippet: string): string | undefined {
  const setores = [
    'automotivo',
    'tecnologia',
    'alimentos',
    'farmacêutico',
    'construção',
    'energia',
    'financeiro',
    'varejo',
    'logística',
    'saúde',
    'educação',
    'agronegócio',
    'telecomunicações',
  ];

  const snippetLower = snippet.toLowerCase();

  for (const setor of setores) {
    if (snippetLower.includes(setor)) {
      return setor.charAt(0).toUpperCase() + setor.slice(1);
    }
  }

  return undefined;
}

/**
 * Extrai localização da descrição
 */
function extractLocation(snippet: string): string | undefined {
  const cidades = [
    'São Paulo',
    'Rio de Janeiro',
    'Belo Horizonte',
    'Curitiba',
    'Porto Alegre',
    'Brasília',
    'Salvador',
    'Fortaleza',
    'Recife',
    'Campinas',
    'Manaus',
    'Goiânia',
  ];

  for (const cidade of cidades) {
    if (snippet.includes(cidade)) {
      return cidade;
    }
  }

  // Buscar estados
  const estados = ['SP', 'RJ', 'MG', 'PR', 'RS', 'SC', 'BA', 'PE', 'CE'];

  for (const estado of estados) {
    const regex = new RegExp(`\\b${estado}\\b`, 'i');
    if (regex.test(snippet)) {
      return estado;
    }
  }

  return undefined;
}

/**
 * Testa conexão com SerpAPI
 */
export async function testSerpApiConnection(): Promise<boolean> {
  try {
    const results = await searchGoogle('test', { num: 1 });
    logger.debug('[SerpAPI] Conexão OK');
    return results.length > 0;
  } catch (error) {
    console.error('[SerpAPI] Falha na conexão:', error);
    return false;
  }
}
