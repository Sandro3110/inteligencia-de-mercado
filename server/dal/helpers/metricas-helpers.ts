/**
 * Helpers para cálculo de métricas de negócio
 * Funções auxiliares para calcular e validar métricas financeiras e scores
 */

/**
 * Calcular score de priorização
 * Formula: (scoreFit * 0.4) + (probabilidadeConversao * 0.3) + (receitaPotencial * 0.3)
 */
export function calcularScorePriorizacao(params: {
  scoreFit: number;
  probabilidadeConversao: number;
  receitaPotencialAnual: number;
}): number {
  const { scoreFit, probabilidadeConversao, receitaPotencialAnual } = params;
  
  // Normalizar receita potencial para 0-100
  // Assumindo que R$100M = 100 pontos
  const receitaNormalizada = Math.min((receitaPotencialAnual / 100000000) * 100, 100);
  
  const score = (scoreFit * 0.4) + (probabilidadeConversao * 0.3) + (receitaNormalizada * 0.3);
  
  return Math.round(Math.min(Math.max(score, 0), 100));
}

/**
 * Calcular segmento ABC baseado em receita potencial
 */
export function calcularSegmentoAbc(receitaPotencialAnual: number): 'A' | 'B' | 'C' {
  if (receitaPotencialAnual > 50000000) return 'A';
  if (receitaPotencialAnual > 10000000) return 'B';
  return 'C';
}

/**
 * Determinar se é cliente ideal
 * Critérios: scoreFit >80, probabilidadeConversao >60, segmento A ou B
 */
export function isClienteIdeal(params: {
  scoreFit: number;
  probabilidadeConversao: number;
  segmentoAbc: 'A' | 'B' | 'C';
}): boolean {
  const { scoreFit, probabilidadeConversao, segmentoAbc } = params;
  
  return (
    scoreFit > 80 &&
    probabilidadeConversao > 60 &&
    (segmentoAbc === 'A' || segmentoAbc === 'B')
  );
}

/**
 * Calcular LTV (Lifetime Value) estimado
 * Formula simplificada: ticketMedio * frequenciaAnual * anosRelacionamento
 */
export function calcularLTV(params: {
  ticketMedio: number;
  frequenciaAnual?: number;
  anosRelacionamento?: number;
}): number {
  const frequencia = params.frequenciaAnual || 12; // 12 compras/ano por padrão
  const anos = params.anosRelacionamento || 3; // 3 anos por padrão
  
  return Math.round(params.ticketMedio * frequencia * anos);
}

/**
 * Calcular CAC (Customer Acquisition Cost) estimado
 * Formula simplificada: baseado em porte e complexidade
 */
export function calcularCAC(params: {
  porte: 'micro' | 'pequena' | 'media' | 'grande';
  cicloVendaDias: number;
}): number {
  const { porte, cicloVendaDias } = params;
  
  // Custo base por porte
  const custoBase = {
    micro: 500,
    pequena: 2000,
    media: 8000,
    grande: 25000,
  };
  
  // Multiplicador por ciclo de venda (quanto maior o ciclo, maior o CAC)
  const multiplicador = 1 + (cicloVendaDias / 365);
  
  return Math.round(custoBase[porte] * multiplicador);
}

/**
 * Calcular ticket médio estimado baseado em porte e tipo de produto
 */
export function calcularTicketMedio(params: {
  porte: 'micro' | 'pequena' | 'media' | 'grande';
  tipoProduto: 'software' | 'servico' | 'produto';
  receitaPotencialAnual?: number;
}): number {
  const { porte, tipoProduto, receitaPotencialAnual } = params;
  
  // Se temos receita potencial, usar 1/12 como ticket médio
  if (receitaPotencialAnual) {
    return Math.round(receitaPotencialAnual / 12);
  }
  
  // Tabela de tickets médios por porte e tipo
  const tickets = {
    software: {
      micro: 500,
      pequena: 3000,
      media: 15000,
      grande: 50000,
    },
    servico: {
      micro: 1000,
      pequena: 5000,
      media: 20000,
      grande: 80000,
    },
    produto: {
      micro: 2000,
      pequena: 10000,
      media: 40000,
      grande: 150000,
    },
  };
  
  return tickets[tipoProduto][porte];
}

/**
 * Calcular receita potencial anual baseado em porte e setor
 */
export function calcularReceitaPotencial(params: {
  porte: 'micro' | 'pequena' | 'media' | 'grande';
  setor: string;
  faturamentoAnual?: number;
}): number {
  const { porte, faturamentoAnual } = params;
  
  // Se temos faturamento, usar % dele como potencial
  if (faturamentoAnual) {
    // Assumir que podem gastar 2-5% do faturamento em soluções
    const percentual = {
      micro: 0.02,
      pequena: 0.03,
      media: 0.04,
      grande: 0.05,
    };
    
    return Math.round(faturamentoAnual * percentual[porte]);
  }
  
  // Tabela de receitas potenciais por porte
  const potenciais = {
    micro: 50000,
    pequena: 300000,
    media: 1500000,
    grande: 5000000,
  };
  
  return potenciais[porte];
}

/**
 * Calcular ciclo de venda estimado baseado em porte e complexidade
 */
export function calcularCicloVenda(params: {
  porte: 'micro' | 'pequena' | 'media' | 'grande';
  complexidade?: 'baixa' | 'media' | 'alta';
}): number {
  const { porte, complexidade = 'media' } = params;
  
  // Ciclos base por porte (em dias)
  const ciclosBase = {
    micro: 30,
    pequena: 60,
    media: 90,
    grande: 180,
  };
  
  // Multiplicadores por complexidade
  const multiplicadores = {
    baixa: 0.7,
    media: 1.0,
    alta: 1.5,
  };
  
  return Math.round(ciclosBase[porte] * multiplicadores[complexidade]);
}

/**
 * Validar score (garantir que está entre 0-100)
 */
export function validarScore(score: number | null | undefined): number {
  if (score === null || score === undefined) return 0;
  return Math.round(Math.min(Math.max(score, 0), 100));
}

/**
 * Validar valor financeiro (garantir que não é negativo)
 */
export function validarValorFinanceiro(valor: number | null | undefined): number {
  if (valor === null || valor === undefined) return 0;
  return Math.max(valor, 0);
}

/**
 * Calcular score de fit baseado em completude de dados
 */
export function calcularScoreFitCompletude(dados: {
  cnpj?: string;
  porte?: string;
  faturamento?: number;
  numFuncionarios?: number;
  cnae?: string;
  site?: string;
}): number {
  let score = 0;
  
  if (dados.cnpj) score += 20;
  if (dados.porte) score += 20;
  if (dados.faturamento) score += 20;
  if (dados.numFuncionarios) score += 15;
  if (dados.cnae) score += 15;
  if (dados.site) score += 10;
  
  return score;
}

/**
 * Calcular qualidade score geral do enriquecimento
 */
export function calcularQualidadeScore(params: {
  clienteCompleto: boolean;
  mercadoCompleto: boolean;
  produtosCompletos: boolean;
  concorrentesCompletos: boolean;
  leadsCompletos: boolean;
}): number {
  let score = 0;
  
  if (params.clienteCompleto) score += 40;
  if (params.mercadoCompleto) score += 20;
  if (params.produtosCompletos) score += 15;
  if (params.concorrentesCompletos) score += 15;
  if (params.leadsCompletos) score += 10;
  
  return score;
}

/**
 * Classificar qualidade baseado no score
 */
export function classificarQualidade(score: number): 'excelente' | 'bom' | 'aceitavel' | 'ruim' {
  if (score >= 90) return 'excelente';
  if (score >= 70) return 'bom';
  if (score >= 50) return 'aceitavel';
  return 'ruim';
}

/**
 * Calcular margem estimada por tipo de produto
 */
export function calcularMargemEstimada(tipoProduto: 'software' | 'servico' | 'produto'): number {
  const margens = {
    software: 70, // 60-80%
    servico: 40,  // 30-50%
    produto: 30,  // 20-40%
  };
  
  return margens[tipoProduto];
}

/**
 * Calcular share of voice estimado baseado em porte
 */
export function calcularShareOfVoice(params: {
  porte: 'micro' | 'pequena' | 'media' | 'grande';
  posicaoMercado?: number; // 1-5
}): number {
  const { porte, posicaoMercado = 3 } = params;
  
  // Share base por porte
  const shareBase = {
    micro: 5,
    pequena: 15,
    media: 30,
    grande: 50,
  };
  
  // Ajustar por posição (1º = +50%, 5º = -50%)
  const ajuste = 1 + ((3 - posicaoMercado) * 0.25);
  
  return Math.round(Math.min(shareBase[porte] * ajuste, 100));
}
