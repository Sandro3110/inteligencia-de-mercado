/**
 * Módulo de integração com SerpAPI
 * Usado para buscar concorrentes reais via Google Search
 */

interface SerpAPISearchParams {
  query: string;
  location?: string;
  num?: number;
}

interface SerpAPIResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
}

interface CompetitorData {
  nome: string;
  site?: string;
  descricao?: string;
  fonte: string;
}

/**
 * Busca concorrentes via SerpAPI
 */
export async function searchCompetitors(
  params: SerpAPISearchParams
): Promise<CompetitorData[]> {
  const apiKey = process.env.SERPAPI_KEY;

  if (!apiKey) {
    throw new Error("SERPAPI_KEY not configured");
  }

  const { query, location = "Brazil", num = 10 } = params;

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google");
  url.searchParams.set("q", query);
  url.searchParams.set("location", location);
  url.searchParams.set("num", num.toString());
  url.searchParams.set("api_key", apiKey);

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(
        `SerpAPI error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`SerpAPI error: ${data.error}`);
    }

    const results: SerpAPIResult[] = data.organic_results || [];

    return results.map(result => ({
      nome: result.title,
      site: result.link,
      descricao: result.snippet,
      fonte: "SerpAPI Google Search",
    }));
  } catch (error) {
    console.error("[SerpAPI] Error searching competitors:", error);
    throw error;
  }
}

/**
 * Extrai CNPJ de um texto (se encontrado)
 */
export function extractCNPJ(text: string): string | null {
  // Padrão: XX.XXX.XXX/XXXX-XX ou XXXXXXXXXXXXXX
  const patterns = [/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g, /\d{14}/g];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].replace(/\D/g, ""); // Remove formatação
    }
  }

  return null;
}

/**
 * Busca informações de uma empresa específica
 */
export async function searchCompanyInfo(
  companyName: string
): Promise<CompetitorData | null> {
  try {
    const results = await searchCompetitors({
      query: `${companyName} CNPJ empresa brasil`,
      num: 3,
    });

    if (results.length === 0) {
      return null;
    }

    // Retorna o primeiro resultado
    return results[0];
  } catch (error) {
    console.error("[SerpAPI] Error searching company info:", error);
    return null;
  }
}
