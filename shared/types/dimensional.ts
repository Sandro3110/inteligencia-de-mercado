/**
 * Types para Sistema Dimensional de BI
 * Temperatura: 1.0
 * 100% Funcional
 */

// ============================================================================
// DIMENSÕES
// ============================================================================

export interface DimensaoTempo {
  id: number;
  data: Date;
  ano: number;
  trimestre: number;
  mes: number;
  semana: number;
  diaSemana: number;
  diaAno: number;
  nomeMes: string;
  nomeDiaSemana: string;
  ehFeriado: boolean;
  ehFimDeSemana: boolean;
}

export interface DimensaoGeografia {
  id: number;
  pais: string;
  macrorregiao: string | null;
  mesorregiao: string | null;
  microrregiao: string | null;
  estado: string;
  siglaEstado: string;
  cidade: string;
  codigoIbge: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface DimensaoMercado {
  id: number;
  nome: string;
  setor: string | null;
  subsetor: string | null;
  nicho: string | null;
  descricao: string | null;
  tamanhoEstimado: number | null;
  crescimentoAnual: number | null;
}

export interface DimensaoCanal {
  id: number;
  nome: string;
  tipo: 'inbound' | 'outbound' | 'referral' | 'direct' | 'partnership' | 'event' | 'other';
  descricao: string | null;
  custoMedio: number | null;
  taxaConversao: number | null;
}

// ============================================================================
// FILTROS
// ============================================================================

export type OperadorFiltro = '=' | '!=' | '>' | '>=' | '<' | '<=' | 'IN' | 'NOT IN' | 'LIKE' | 'BETWEEN';

export interface Filtro {
  campo: string;
  operador: OperadorFiltro;
  valor: any;
  label?: string;
}

export interface FiltroInteligente extends Filtro {
  sugestao?: boolean;
  impacto?: {
    registrosAntes: number;
    registrosDepois: number;
    reducaoPercentual: number;
    tempoEstimado: number; // em segundos
  };
}

export interface AlertaPerformance {
  tipo: 'info' | 'warning' | 'error';
  mensagem: string;
  registrosEstimados: number;
  tempoEstimado: number; // em segundos
  sugestoes: FiltroInteligente[];
}

export interface CombinacaoRecomendada {
  nome: string;
  descricao: string;
  filtros: Filtro[];
  metricas: {
    registros: number;
    receitaPotencial: number;
    scoreMedia: number;
    taxaConversaoHistorica: number;
  };
}

// ============================================================================
// BUSCA SEMÂNTICA
// ============================================================================

export interface BuscaSemanticaInput {
  query: string;
  temperatura?: number;
}

export interface BuscaSemanticaOutput {
  interpretacao: {
    tipo?: 'cliente' | 'lead' | 'concorrente';
    setor?: string;
    regiao?: string[];
    receitaMin?: number;
    receitaMax?: number;
    scoreMin?: number;
    scoreMax?: number;
    segmento?: string[];
    outros?: Record<string, any>;
  };
  filtros: Filtro[];
  confianca: number; // 0-100
  sugestoes?: string[];
}

// ============================================================================
// CONSULTA DIMENSIONAL
// ============================================================================

export interface ConsultaDimensionalInput {
  dimensoes: {
    tempo?: string | number; // ID ou período
    geografia?: string | number; // ID ou nome
    mercado?: string | number; // ID ou nome
  };
  filtros: Filtro[];
  metricas: string[]; // ['count', 'sum_receita', 'avg_score', etc]
  agrupamento?: string[]; // campos para GROUP BY
  ordenacao?: {
    campo: string;
    direcao: 'ASC' | 'DESC';
  }[];
  limit?: number;
  offset?: number;
}

export interface ConsultaDimensionalOutput<T = any> {
  dados: T[];
  total: number;
  pagina: number;
  porPagina: number;
  tempoExecucao: number; // em ms
  alert?: AlertaPerformance;
}

// ============================================================================
// DRILL-DOWN
// ============================================================================

export type NivelHierarquia = 
  | 'pais' 
  | 'macrorregiao' 
  | 'mesorregiao' 
  | 'microrregiao' 
  | 'estado' 
  | 'cidade'
  | 'setor'
  | 'subsetor'
  | 'nicho';

export interface DrillDownInput {
  nivelAtual: NivelHierarquia;
  codigo: string | number;
  metrica?: string;
}

export interface DrillDownOutput {
  nivelAnterior: NivelHierarquia | null;
  nivelAtual: NivelHierarquia;
  nivelProximo: NivelHierarquia | null;
  breadcrumb: {
    nivel: NivelHierarquia;
    codigo: string | number;
    nome: string;
  }[];
  dados: any[];
}

// ============================================================================
// EXPORTAÇÃO
// ============================================================================

export type FormatoExportacao = 'excel' | 'csv' | 'json' | 'markdown';

export interface ExportacaoInput {
  formato: FormatoExportacao;
  dados: any[];
  colunas?: {
    campo: string;
    label: string;
    formato?: 'moeda' | 'numero' | 'percentual' | 'data' | 'texto';
  }[];
  titulo?: string;
  incluirGraficos?: boolean;
  incluirResumo?: boolean;
}

export interface ExportacaoOutput {
  url: string;
  nome: string;
  tamanho: number; // em bytes
  formato: FormatoExportacao;
}

// ============================================================================
// CÓPIA
// ============================================================================

export type FormatoCopia = 'texto' | 'markdown' | 'json' | 'csv';

export interface CopiaInput {
  dados: any;
  formato: FormatoCopia;
  template?: string; // template customizado
}

export interface CopiaOutput {
  conteudo: string;
  formato: FormatoCopia;
}

// ============================================================================
// MAPA
// ============================================================================

export interface MapaCluster {
  id: string;
  latitude: number;
  longitude: number;
  quantidade: number;
  receita: number;
  scoreMedia: number;
  entidades: {
    id: number;
    nome: string;
    tipo: 'cliente' | 'lead' | 'concorrente';
  }[];
}

export interface MapaHeatmapPoint {
  latitude: number;
  longitude: number;
  peso: number; // intensidade
}

export interface MapaInput {
  nivel: NivelHierarquia;
  metrica: 'quantidade' | 'receita' | 'score';
  filtros: Filtro[];
  camadas: {
    clusters: boolean;
    heatmap: boolean;
    rotas: boolean;
    fronteiras: boolean;
  };
}

export interface MapaOutput {
  clusters: MapaCluster[];
  heatmap: MapaHeatmapPoint[];
  bounds: {
    norte: number;
    sul: number;
    leste: number;
    oeste: number;
  };
  centro: {
    latitude: number;
    longitude: number;
  };
  zoom: number;
}

// ============================================================================
// HIERARQUIA
// ============================================================================

export interface HierarquiaNode {
  id: string;
  nome: string;
  nivel: NivelHierarquia;
  pai: string | null;
  filhos: HierarquiaNode[];
  metricas: {
    quantidade: number;
    receita: number;
    scoreMedia: number;
    crescimento: number;
  };
  expandido: boolean;
}

export interface HierarquiaInput {
  tipo: 'geografia' | 'mercado';
  raiz?: string | number; // ID do nó raiz
  profundidade?: number; // quantos níveis carregar
  metrica?: string;
}

export interface HierarquiaOutput {
  raiz: HierarquiaNode;
  totalNos: number;
  profundidadeMaxima: number;
}

// ============================================================================
// ANÁLISE TEMPORAL
// ============================================================================

export type GranularidadeTemporal = 'dia' | 'semana' | 'mes' | 'trimestre' | 'ano';

export interface AnaliseTemporalInput {
  dataInicio: Date;
  dataFim: Date;
  granularidade: GranularidadeTemporal;
  metricas: string[];
  compararCom?: 'periodo_anterior' | 'ano_anterior' | 'media_historica';
  filtros?: Filtro[];
}

export interface AnaliseTemporalOutput {
  periodos: {
    data: Date;
    label: string;
    metricas: Record<string, number>;
  }[];
  comparacao?: {
    periodos: {
      data: Date;
      label: string;
      metricas: Record<string, number>;
    }[];
  };
  insights: {
    tipo: 'crescimento' | 'queda' | 'pico' | 'vale' | 'tendencia' | 'sazonalidade';
    mensagem: string;
    impacto: 'alto' | 'medio' | 'baixo';
  }[];
  breakdown: {
    porTipo: Record<string, number>;
    porSegmento: Record<string, number>;
    porRegiao: Record<string, number>;
  };
}

// ============================================================================
// ENTIDADE 360°
// ============================================================================

export interface Entidade360Input {
  id: number;
}

export interface Entidade360Output {
  // Dados básicos
  entidade: {
    id: number;
    nome: string;
    nomeFantasia: string | null;
    tipo: 'cliente' | 'lead' | 'concorrente';
    cnpj: string | null;
    email: string | null;
    telefone: string | null;
    site: string | null;
    porte: string | null;
    numFuncionarios: number | null;
    faturamentoAnual: number | null;
  };
  
  // Localização
  geografia: DimensaoGeografia;
  
  // Mercado
  mercado: DimensaoMercado;
  
  // Contexto e scores
  contexto: {
    scoreFit: number | null;
    probabilidadeConversao: number | null;
    scorePriorizacao: number | null;
    segmentoRfm: string | null;
    segmentoAbc: string | null;
    ehClienteIdeal: boolean;
    cicloVendaEstimadoDias: number | null;
    justificativaScore: string | null;
    recomendacoes: string | null;
  };
  
  // Métricas financeiras
  financeiro: {
    receitaPotencialAnual: number | null;
    ticketMedioEstimado: number | null;
    ltvEstimado: number | null;
    cacEstimado: number | null;
    roiEstimado: number | null;
  };
  
  // Produtos (3)
  produtos: {
    id: number;
    nome: string;
    descricao: string | null;
    volumeVendasEstimado: number | null;
    margemEstimada: number | null;
    penetracaoMercado: number | null;
    ehProdutoPrincipal: boolean;
  }[];
  
  // Concorrentes (5)
  concorrentes: {
    id: number;
    nome: string;
    shareOfVoice: number | null;
    vantagemCompetitivaScore: number | null;
    ameacaNivel: 'baixa' | 'media' | 'alta' | null;
  }[];
  
  // Leads (5)
  leads: {
    id: number;
    nome: string;
    scoreFit: number | null;
    probabilidadeConversao: number | null;
    receitaPotencial: number | null;
  }[];
  
  // Rastreabilidade
  rastreabilidade: {
    origem: 'importacao' | 'enriquecimento' | 'manual';
    dataOrigem: Date;
    usuarioOrigem: string | null;
    custoEnriquecimento: number | null;
    qualidadeDados: number | null;
    modeloIA: string | null;
    temperatura: number | null;
    ultimaAtualizacao: Date | null;
    usuarioAtualizacao: string | null;
  };
  
  // Histórico
  historico: {
    id: number;
    tipo: 'criacao' | 'atualizacao' | 'enriquecimento' | 'conversao' | 'outro';
    descricao: string;
    data: Date;
    usuario: string | null;
  }[];
}

// ============================================================================
// KPIs
// ============================================================================

export interface KPI {
  nome: string;
  valor: number | string;
  formato: 'numero' | 'moeda' | 'percentual' | 'texto';
  variacao?: {
    valor: number;
    percentual: number;
    direcao: 'subiu' | 'desceu' | 'estavel';
  };
  meta?: number;
  copiavel: boolean;
}

export interface DashboardKPIs {
  principal: KPI[];
  secundario: KPI[];
  breakdown: {
    titulo: string;
    itens: {
      label: string;
      valor: number;
      percentual: number;
    }[];
  }[];
}
