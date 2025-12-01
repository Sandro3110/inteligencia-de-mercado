/**
 * Types para o sistema unificado de entidades
 * Baseado na nova estrutura dimensional (fato_entidades)
 */

// ============================================================================
// ENUMS E TIPOS BASE
// ============================================================================

export type TipoEntidade = 'cliente' | 'lead' | 'concorrente';

export type StatusQualificacao =
  | 'ativo'
  | 'inativo'
  | 'prospect'
  | 'lead_qualificado'
  | 'lead_desqualificado';

export type QualidadeClassificacao = 'A' | 'B' | 'C' | 'D';

export type ValidationStatus = 'pending' | 'approved' | 'rejected' | 'needs_review';

export type LeadStage =
  | 'novo'
  | 'contato_inicial'
  | 'qualificado'
  | 'proposta'
  | 'negociacao'
  | 'ganho'
  | 'perdido';

export type Porte = 'MEI' | 'ME' | 'EPP' | 'Médio' | 'Grande';

export type SegmentacaoB2B = 'B2B' | 'B2C' | 'B2B2C';

// ============================================================================
// INTERFACES DE DIMENSÕES
// ============================================================================

export interface DimGeografia {
  id: number;
  cidade: string;
  uf: string;
  regiao: string;
  latitude?: number;
  longitude?: number;
  created_at: Date;
  updated_at: Date;
}

export interface DimMercado {
  id: number;
  mercado_hash: string;
  nome: string;
  categoria: string;
  segmentacao?: string;
  tamanho_mercado?: string;
  crescimento_anual?: string;
  tendencias?: string;
  principais_players?: string;
  pesquisa_id: number;
  project_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface DimProduto {
  id: number;
  produto_hash: string;
  nome: string;
  categoria: string;
  descricao?: string;
  preco?: string;
  unidade?: string;
  ativo: boolean;
  mercado_id?: number;
  pesquisa_id: number;
  project_id: number;
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// INTERFACE PRINCIPAL: FATO_ENTIDADES
// ============================================================================

export interface FatoEntidade {
  id: number;

  // Tipo e identificação
  tipo_entidade: TipoEntidade;
  entidade_hash: string;
  nome: string;
  cnpj?: string;

  // Relacionamentos obrigatórios
  pesquisa_id: number;
  project_id: number;
  geografia_id: number;
  mercado_id: number;

  // Contatos
  email?: string;
  telefone?: string;
  site_oficial?: string;
  linkedin?: string;
  instagram?: string;

  // Classificação
  cnae?: string;
  porte?: Porte;
  segmentacao_b2b_b2c?: SegmentacaoB2B;

  // Financeiro
  faturamento_declarado?: string;
  faturamento_estimado?: string;
  numero_estabelecimentos?: string;

  // Qualidade
  qualidade_score?: number;
  qualidade_classificacao?: QualidadeClassificacao;
  status_qualificacao: StatusQualificacao;

  // Validação
  validation_status?: ValidationStatus;
  validation_notes?: string;
  validated_by?: string;
  validated_at?: Date;

  // Campos específicos de leads
  lead_stage?: LeadStage;
  stage_updated_at?: Date;
  cliente_origem_id?: number;

  // Metadados
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// INTERFACES ESPECIALIZADAS (VIEWS)
// ============================================================================

/**
 * Cliente: entidade com tipo='cliente'
 */
export interface Cliente extends Omit<
  FatoEntidade,
  'tipo_entidade' | 'lead_stage' | 'stage_updated_at' | 'cliente_origem_id'
> {
  tipo_entidade: 'cliente';
}

/**
 * Lead: entidade com tipo='lead'
 */
export interface Lead extends FatoEntidade {
  tipo_entidade: 'lead';
  lead_stage: LeadStage;
}

/**
 * Concorrente: entidade com tipo='concorrente'
 */
export interface Concorrente extends Omit<
  FatoEntidade,
  'tipo_entidade' | 'lead_stage' | 'stage_updated_at' | 'cliente_origem_id'
> {
  tipo_entidade: 'concorrente';
}

// ============================================================================
// INTERFACES DE RELACIONAMENTOS N:N
// ============================================================================

export interface EntidadeProduto {
  id: number;
  entidade_id: number;
  produto_id: number;
  tipo_relacao?: string; // 'fabrica' | 'vende' | 'distribui' | 'usa'
  created_at: Date;
}

export interface EntidadeCompetidor {
  id: number;
  entidade_id: number;
  competidor_id: number;
  mercado_id: number;
  nivel_competicao?: string; // 'direto' | 'indireto' | 'substituto'
  created_at: Date;
}

// ============================================================================
// INTERFACES COM JOINS (PARA QUERIES)
// ============================================================================

/**
 * Entidade com dados de geografia
 */
export interface EntidadeComGeografia extends FatoEntidade {
  geografia: DimGeografia;
}

/**
 * Entidade com dados de mercado
 */
export interface EntidadeComMercado extends FatoEntidade {
  mercado: DimMercado;
}

/**
 * Entidade completa (com todas as dimensões)
 */
export interface EntidadeCompleta extends FatoEntidade {
  geografia: DimGeografia;
  mercado: DimMercado;
  produtos: (DimProduto & { tipo_relacao?: string })[];
  concorrentes: (FatoEntidade & { nivel_competicao?: string })[];
}

// ============================================================================
// FILTROS E PAGINAÇÃO
// ============================================================================

export interface FiltrosEntidade {
  // Filtros básicos
  tipo_entidade?: TipoEntidade | TipoEntidade[];
  pesquisa_id?: number;
  project_id?: number;
  status_qualificacao?: StatusQualificacao | StatusQualificacao[];

  // Filtros de dimensão
  geografia_id?: number;
  mercado_id?: number;
  regiao?: string;
  uf?: string;
  cidade?: string;
  categoria_mercado?: string;

  // Filtros de qualidade
  qualidade_min?: number;
  qualidade_max?: number;
  qualidade_classificacao?: QualidadeClassificacao | QualidadeClassificacao[];
  validation_status?: ValidationStatus | ValidationStatus[];

  // Filtros de lead
  lead_stage?: LeadStage | LeadStage[];

  // Filtros de texto
  busca?: string; // busca em nome, cnpj, email

  // Ordenação
  orderBy?: 'nome' | 'qualidade_score' | 'created_at' | 'updated_at';
  orderDirection?: 'asc' | 'desc';

  // Paginação
  page?: number;
  limit?: number;
}

export interface ResultadoPaginado<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ============================================================================
// ESTATÍSTICAS E MÉTRICAS
// ============================================================================

export interface EstatisticasEntidades {
  total: number;
  por_tipo: Record<TipoEntidade, number>;
  por_status: Record<StatusQualificacao, number>;
  por_qualidade: Record<QualidadeClassificacao, number>;
  qualidade_media: number;
  com_mercado: number;
  com_produtos: number;
  com_concorrentes: number;
  validados: number;
}

export interface EstatisticasPorDimensao {
  por_regiao: { regiao: string; total: number }[];
  por_uf: { uf: string; total: number }[];
  por_mercado: { mercado: string; total: number }[];
  por_categoria: { categoria: string; total: number }[];
}

// ============================================================================
// INPUT TYPES (PARA CRIAÇÃO/ATUALIZAÇÃO)
// ============================================================================

export type CriarEntidadeInput = Omit<
  FatoEntidade,
  'id' | 'entidade_hash' | 'created_at' | 'updated_at'
> & {
  entidade_hash?: string; // opcional, será gerado se não fornecido
};

export type AtualizarEntidadeInput = Partial<
  Omit<FatoEntidade, 'id' | 'entidade_hash' | 'tipo_entidade' | 'created_at'>
>;

// ============================================================================
// HISTÓRICO DE MUDANÇAS
// ============================================================================

export interface FatoEntidadeHistory {
  id: number;
  entidade_id: number;
  data_snapshot: Record<string, any>; // JSONB
  change_type: 'created' | 'updated' | 'deleted';
  changed_by?: string;
  changed_at: Date;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Type guard para verificar se é Cliente
 */
export function isCliente(entidade: FatoEntidade): entidade is Cliente {
  return entidade.tipo_entidade === 'cliente';
}

/**
 * Type guard para verificar se é Lead
 */
export function isLead(entidade: FatoEntidade): entidade is Lead {
  return entidade.tipo_entidade === 'lead';
}

/**
 * Type guard para verificar se é Concorrente
 */
export function isConcorrente(entidade: FatoEntidade): entidade is Concorrente {
  return entidade.tipo_entidade === 'concorrente';
}

/**
 * Calcular classificação de qualidade baseado no score
 */
export function calcularClassificacaoQualidade(score: number): QualidadeClassificacao {
  if (score >= 90) return 'A';
  if (score >= 70) return 'B';
  if (score >= 50) return 'C';
  return 'D';
}

/**
 * Validar se status_qualificacao é válido para o tipo de entidade
 */
export function validarStatusQualificacao(tipo: TipoEntidade, status: StatusQualificacao): boolean {
  // Clientes: ativo, inativo, prospect
  if (tipo === 'cliente') {
    return ['ativo', 'inativo', 'prospect'].includes(status);
  }

  // Leads: prospect, lead_qualificado, lead_desqualificado
  if (tipo === 'lead') {
    return ['prospect', 'lead_qualificado', 'lead_desqualificado'].includes(status);
  }

  // Concorrentes: ativo, inativo
  if (tipo === 'concorrente') {
    return ['ativo', 'inativo'].includes(status);
  }

  return false;
}
