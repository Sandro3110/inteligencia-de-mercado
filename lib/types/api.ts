/**
 * Tipos padronizados para queries tRPC
 * Garante consistência em todas as respostas da API
 */

// ============================================================================
// BASE TYPES
// ============================================================================

/**
 * Input base para queries que requerem projeto
 */
export interface BaseQueryInput {
  projectId: number;
  pesquisaId?: number;
}

/**
 * Metadata padrão para todas as respostas
 */
export interface ResponseMetadata {
  projectId: number;
  projectName: string;
  lastUpdate: string;
  timestamp: string;
}

/**
 * Resposta base para estatísticas
 */
export interface BaseStatsResponse {
  totals: Record<string, number>;
  metadata: ResponseMetadata;
}

/**
 * Resposta base para listas paginadas
 */
export interface BaseListResponse<T> {
  items: T[];
  total: number;
  page?: number;
  pageSize?: number;
  hasMore?: boolean;
}

/**
 * Resposta base para operações de mutação
 */
export interface BaseMutationResponse {
  success: boolean;
  message: string;
  data?: any;
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * Status de validação
 */
export type ValidationStatus = 'pending' | 'rich' | 'needs_adjustment' | 'discarded';

/**
 * Item de validação por status
 */
export interface ValidationStatusItem {
  status: ValidationStatus | null;
  count: number;
}

/**
 * Resposta de validação por entidade
 */
export interface ValidationResponse {
  clientes: ValidationStatusItem[];
  concorrentes: ValidationStatusItem[];
  leads: ValidationStatusItem[];
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

/**
 * Resposta de estatísticas para Analytics
 */
export interface AnalyticsStatsResponse {
  totals: {
    mercados: number;
    clientes: number;
    concorrentes: number;
    leads: number;
  };
  validation: ValidationResponse;
  metadata: ResponseMetadata;
}

/**
 * Resposta de estatísticas para Dashboard
 */
export interface DashboardStatsResponse {
  projects: number;
  pesquisas: number;
  mercados: number;
  leads: number;
  clientes: number;
  concorrentes: number;
  metadata?: ResponseMetadata;
}

// ============================================================================
// ENTITY TYPES
// ============================================================================

/**
 * Projeto
 */
export interface Project {
  id: number;
  nome: string;
  descricao: string | null;
  cor: string;
  ativo: number;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
}

/**
 * Pesquisa
 */
export interface Pesquisa {
  id: number;
  projectId: number;
  nome: string;
  descricao: string | null;
  status: string;
  ativo: number;
  totalClientes: number;
  clientesEnriquecidos: number;
  dataImportacao: string | null;
  createdAt: string | null;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Erro padronizado da API
 */
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}
