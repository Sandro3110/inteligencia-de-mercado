/**
 * Módulo de integração com ReceitaWS
 * Valida e enriquece dados de CNPJs brasileiros
 */

interface ReceitaWSResponse {
  status: string;
  nome?: string;
  fantasia?: string;
  cnpj?: string;
  abertura?: string;
  situacao?: string;
  tipo?: string;
  porte?: string;
  natureza_juridica?: string;
  atividade_principal?: Array<{
    code: string;
    text: string;
  }>;
  endereco?: {
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    municipio?: string;
    uf?: string;
    cep?: string;
  };
  telefone?: string;
  email?: string;
  capital_social?: string;
  message?: string;
}

/**
 * Valida e busca informações de um CNPJ na ReceitaWS
 */
export async function validateCNPJ(
  cnpj: string
): Promise<ReceitaWSResponse | null> {
  const apiKey = process.env.RECEITAWS_API_KEY;

  if (!apiKey) {
    console.warn("[ReceitaWS] API key not configured, skipping validation");
    return null;
  }

  // Limpar CNPJ (remover formatação)
  const cleanCNPJ = cnpj.replace(/[^\d]/g, "");

  if (cleanCNPJ.length !== 14) {
    console.warn(`[ReceitaWS] Invalid CNPJ format: ${cnpj}`);
    return null;
  }

  try {
    const response = await fetch(
      `https://www.receitaws.com.br/v1/cnpj/${cleanCNPJ}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      console.warn(
        `[ReceitaWS] HTTP error ${response.status} for CNPJ ${cleanCNPJ}`
      );
      return null;
    }

    const data: ReceitaWSResponse = await response.json();

    if (data.status === "ERROR") {
      console.warn(`[ReceitaWS] Error for CNPJ ${cleanCNPJ}: ${data.message}`);
      return null;
    }

    console.log(`[ReceitaWS] ✅ Validated CNPJ ${cleanCNPJ}: ${data.nome}`);

    return data;
  } catch (error) {
    console.error(`[ReceitaWS] Error validating CNPJ ${cleanCNPJ}:`, error);
    return null;
  }
}

/**
 * Valida múltiplos CNPJs em batch (com delay para respeitar rate limit)
 */
export async function validateCNPJsBatch(
  cnpjs: string[],
  delayMs = 350
): Promise<Map<string, ReceitaWSResponse>> {
  const results = new Map<string, ReceitaWSResponse>();

  console.log(`[ReceitaWS] Validating ${cnpjs.length} CNPJs in batch...`);

  for (const cnpj of cnpjs) {
    const data = await validateCNPJ(cnpj);

    if (data && data.status === "OK") {
      results.set(cnpj, data);
    }

    // Delay entre requisições para respeitar rate limit (3 req/s)
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  console.log(
    `[ReceitaWS] Validated ${results.size}/${cnpjs.length} CNPJs successfully`
  );

  return results;
}

/**
 * Extrai informações úteis de uma resposta da ReceitaWS
 */
export function extractReceitaWSInfo(data: ReceitaWSResponse) {
  return {
    nome: data.nome,
    nomeFantasia: data.fantasia,
    situacao: data.situacao,
    porte: data.porte,
    cidade: data.endereco?.municipio,
    uf: data.endereco?.uf,
    telefone: data.telefone,
    email: data.email,
    atividadePrincipal: data.atividade_principal?.[0]?.text,
  };
}
