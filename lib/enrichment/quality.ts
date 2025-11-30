/**
 * Cálculo de Score de Qualidade para Sistema V2
 *
 * Calcula score baseado na completude dos dados
 */

export interface ClienteQualityData {
  nome: string;
  cnpj?: string | null;
  site?: string | null;
  cidade?: string | null;
  uf?: string | null;
  setor?: string | null;
  descricao?: string | null;
}

export interface ConcorrenteQualityData {
  nome: string;
  cnpj?: string | null;
  site?: string | null;
  cidade?: string | null;
  uf?: string | null;
  produtoPrincipal?: string | null;
}

export interface LeadQualityData {
  nome: string;
  cnpj?: string | null;
  site?: string | null;
  cidade?: string | null;
  uf?: string | null;
  produtoInteresse?: string | null;
}

/**
 * Calcula score de qualidade para CLIENTE
 */
export function calcularQualidadeCliente(data: ClienteQualityData): {
  qualidadeScore: number;
  qualidadeClassificacao: string;
} {
  let score = 0;

  // Nome: obrigatório (já validado)
  score += 10;

  // CNPJ: 20 pontos
  if (data.cnpj && data.cnpj.length >= 14) {
    score += 20;
  }

  // Site: 15 pontos
  if (data.site && data.site.startsWith('http')) {
    score += 15;
  }

  // Localização: 20 pontos (cidade + UF)
  if (data.cidade && data.uf) {
    score += 20;
  }

  // Setor: 15 pontos
  if (data.setor && data.setor.length > 3) {
    score += 15;
  }

  // Descrição: 20 pontos
  if (data.descricao && data.descricao.length > 20) {
    score += 20;
  }

  const qualidadeClassificacao =
    score >= 80 ? 'Excelente' : score >= 60 ? 'Bom' : score >= 40 ? 'Regular' : 'Ruim';

  return {
    qualidadeScore: score,
    qualidadeClassificacao,
  };
}

/**
 * Calcula score de qualidade para CONCORRENTE
 */
export function calcularQualidadeConcorrente(data: ConcorrenteQualityData): {
  qualidadeScore: number;
  qualidadeClassificacao: string;
} {
  let score = 0;

  // Nome: obrigatório (já validado)
  score += 15;

  // CNPJ: 25 pontos
  if (data.cnpj && data.cnpj.length >= 14) {
    score += 25;
  }

  // Site: 20 pontos
  if (data.site && data.site.startsWith('http')) {
    score += 20;
  }

  // Localização: 20 pontos (cidade + UF)
  if (data.cidade && data.uf) {
    score += 20;
  }

  // Produto Principal: 20 pontos
  if (data.produtoPrincipal && data.produtoPrincipal.length > 5) {
    score += 20;
  }

  const qualidadeClassificacao =
    score >= 80 ? 'Excelente' : score >= 60 ? 'Bom' : score >= 40 ? 'Regular' : 'Ruim';

  return {
    qualidadeScore: score,
    qualidadeClassificacao,
  };
}

/**
 * Calcula score de qualidade para LEAD
 */
export function calcularQualidadeLead(data: LeadQualityData): {
  qualidadeScore: number;
  qualidadeClassificacao: string;
} {
  let score = 0;

  // Nome: obrigatório (já validado)
  score += 15;

  // CNPJ: 25 pontos
  if (data.cnpj && data.cnpj.length >= 14) {
    score += 25;
  }

  // Site: 20 pontos
  if (data.site && data.site.startsWith('http')) {
    score += 20;
  }

  // Localização: 20 pontos (cidade + UF)
  if (data.cidade && data.uf) {
    score += 20;
  }

  // Produto de Interesse: 20 pontos
  if (data.produtoInteresse && data.produtoInteresse.length > 5) {
    score += 20;
  }

  const qualidadeClassificacao =
    score >= 80 ? 'Excelente' : score >= 60 ? 'Bom' : score >= 40 ? 'Regular' : 'Ruim';

  return {
    qualidadeScore: score,
    qualidadeClassificacao,
  };
}
