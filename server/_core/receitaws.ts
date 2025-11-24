/**
 * ReceitaWS Integration
 * API pública brasileira para consulta de dados de CNPJ
 * Documentação: https://receitaws.com.br/api
 */

export interface ReceitaWSResponse {
  status: string;
  message?: string;
  cnpj: string;
  tipo: string;
  abertura: string;
  nome: string; // Razão social
  fantasia: string;
  porte: string;
  natureza_juridica: string;
  atividade_principal: Array<{
    code: string;
    text: string;
  }>;
  atividades_secundarias: Array<{
    code: string;
    text: string;
  }>;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  email: string;
  telefone: string;
  situacao: string;
  data_situacao: string;
  motivo_situacao: string;
  capital_social: string;
}

/**
 * Normaliza CNPJ removendo caracteres não numéricos
 */
export function normalizeCNPJ(cnpj: string): string {
  return cnpj.replace(/\D/g, "");
}

/**
 * Valida formato de CNPJ (14 dígitos)
 */
export function isValidCNPJ(cnpj: string): boolean {
  const normalized = normalizeCNPJ(cnpj);
  return normalized.length === 14 && /^\d{14}$/.test(normalized);
}

/**
 * Formata CNPJ para exibição (00.000.000/0000-00)
 */
export function formatCNPJ(cnpj: string): string {
  const normalized = normalizeCNPJ(cnpj);
  if (normalized.length !== 14) return cnpj;

  return normalized.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
}

/**
 * Consulta dados de CNPJ na ReceitaWS
 *
 * Rate limits:
 * - 3 requisições por minuto
 * - Recomendado: usar cache para evitar consultas repetidas
 *
 * @param cnpj CNPJ com ou sem formatação
 * @returns Dados da empresa ou null se não encontrado
 */
export async function consultarCNPJ(
  cnpj: string
): Promise<ReceitaWSResponse | null> {
  const normalized = normalizeCNPJ(cnpj);

  if (!isValidCNPJ(normalized)) {
    console.log(`[ReceitaWS] CNPJ inválido: ${cnpj}`);
    return null;
  }

  const url = `https://receitaws.com.br/v1/cnpj/${normalized}`;

  try {
    console.log(`[ReceitaWS] Consultando CNPJ: ${formatCNPJ(normalized)}`);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.warn("[ReceitaWS] Rate limit excedido (3 req/min)");
        return null;
      }

      if (response.status === 404) {
        console.log(
          `[ReceitaWS] CNPJ não encontrado: ${formatCNPJ(normalized)}`
        );
        return null;
      }

      console.error(`[ReceitaWS] Erro HTTP ${response.status}`);
      return null;
    }

    const data: ReceitaWSResponse = await response.json();

    if (data.status === "ERROR") {
      console.log(`[ReceitaWS] Erro na consulta: ${data.message}`);
      return null;
    }

    console.log(`[ReceitaWS] Dados encontrados: ${data.nome}`);
    return data;
  } catch (error) {
    console.error("[ReceitaWS] Erro na requisição:", error);
    return null;
  }
}

/**
 * Extrai porte da empresa a partir dos dados da Receita
 */
export function extractPorte(data: ReceitaWSResponse): string {
  // ReceitaWS retorna: "DEMAIS", "ME", "EPP", etc.
  const porteMap: Record<string, string> = {
    ME: "Microempresa",
    EPP: "Pequena",
    DEMAIS: "Média/Grande",
  };

  return porteMap[data.porte] || data.porte || "Desconhecido";
}

/**
 * Extrai endereço completo formatado
 */
export function extractEndereco(data: ReceitaWSResponse): string {
  const parts = [
    data.logradouro,
    data.numero,
    data.complemento,
    data.bairro,
    data.municipio,
    data.uf,
    data.cep,
  ].filter(Boolean);

  return parts.join(", ");
}

/**
 * Extrai CNAE principal (código e descrição)
 */
export function extractCNAE(data: ReceitaWSResponse): string {
  if (data.atividade_principal && data.atividade_principal.length > 0) {
    const cnae = data.atividade_principal[0];
    return `${cnae.code} - ${cnae.text}`;
  }
  return "";
}
