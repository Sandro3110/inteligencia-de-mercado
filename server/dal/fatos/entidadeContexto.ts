/**
 * DAL para fato_entidade_contexto
 * Tabela central do modelo - conecta entidade com projeto, pesquisa, geografia, mercado, status
 * 
 * Business Rules:
 * - Entidade única por projeto + pesquisa
 * - Qualidade score 0-100
 * - Soft delete
 * - JOIN com todas as dimensões para contexto completo
 */

import { db } from '../../db';
import { getOrderColumn } from '../../helpers/order-by';
import {
  fato_entidade_contexto,
  dim_entidade,
  dim_projeto,
  dim_pesquisa,
  dim_geografia,
  dim_mercado,
  dim_status_qualificacao,
} from '../../../drizzle/schema';
import { eq, and, or, desc, asc, count, isNull, sql } from 'drizzle-orm';

// ============================================================================
// TIPOS
// ============================================================================

export interface CreateContextoInput {
  entidadeId: number;
  projetoId: number;
  pesquisaId: number;
  geografiaId?: number;
  mercadoId?: number;
  statusQualificacaoId?: number;
  cnae?: string;
  porte?: string;
  faturamentoEstimado?: number;
  numFuncionarios?: number;
  qualidadeScore?: number;
  qualidadeClassificacao?: string;
  observacoes?: string;
  // Novos campos temporais
  tempoId?: number;
  dataQualificacao?: Date;
  // Novas métricas financeiras
  receitaPotencialAnual?: number;
  ticketMedioEstimado?: number;
  ltvEstimado?: number;
  cacEstimado?: number;
  // Scores e probabilidades
  scoreFit?: number;
  probabilidadeConversao?: number;
  scorePriorizacao?: number;
  // Ciclo de venda
  cicloVendaEstimadoDias?: number;
  // Segmentação
  segmentoRfm?: string;
  segmentoAbc?: string;
  ehClienteIdeal?: boolean;
  // Flags de conversão
  convertidoEmCliente?: boolean;
  dataConversao?: Date;
  // Observações enriquecidas
  justificativaScore?: string;
  recomendacoes?: string;
  // Canal
  canalId?: number;
  createdBy?: string;
}

export interface UpdateContextoInput {
  geografiaId?: number;
  mercadoId?: number;
  statusQualificacaoId?: number;
  cnae?: string;
  porte?: string;
  faturamentoEstimado?: number;
  numFuncionarios?: number;
  qualidadeScore?: number;
  qualidadeClassificacao?: string;
  observacoes?: string;
  // Novos campos temporais
  tempoId?: number;
  dataQualificacao?: Date;
  // Novas métricas financeiras
  receitaPotencialAnual?: number;
  ticketMedioEstimado?: number;
  ltvEstimado?: number;
  cacEstimado?: number;
  // Scores e probabilidades
  scoreFit?: number;
  probabilidadeConversao?: number;
  scorePriorizacao?: number;
  // Ciclo de venda
  cicloVendaEstimadoDias?: number;
  // Segmentação
  segmentoRfm?: string;
  segmentoAbc?: string;
  ehClienteIdeal?: boolean;
  // Flags de conversão
  convertidoEmCliente?: boolean;
  dataConversao?: Date;
  // Observações enriquecidas
  justificativaScore?: string;
  recomendacoes?: string;
  // Canal
  canalId?: number;
  updatedBy?: string;
}

export interface ContextoFilters {
  entidadeId?: number;
  projetoId?: number;
  pesquisaId?: number;
  geografiaId?: number;
  mercadoId?: number;
  statusQualificacaoId?: number;
  qualidadeScoreMin?: number;
  qualidadeScoreMax?: number;
  orderBy?: 'created_at' | 'qualidade_score';
  orderDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  incluirDeletados?: boolean;
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
// CRUD BÁSICO
// ============================================================================

/**
 * Criar novo contexto
 */
export async function createContexto(input: CreateContextoInput) {
  // Validações
  if (!input.entidadeId) {
    throw new Error('Entidade ID é obrigatório');
  }

  if (!input.projetoId) {
    throw new Error('Projeto ID é obrigatório');
  }

  if (!input.pesquisaId) {
    throw new Error('Pesquisa ID é obrigatório');
  }

  // Verificar se já existe contexto para essa entidade + projeto + pesquisa
  const contextoExistente = await getContextoByEntidadeProjetoPesquisa(
    input.entidadeId,
    input.projetoId,
    input.pesquisaId
  );

  if (contextoExistente) {
    throw new Error(
      'Já existe um contexto para essa entidade neste projeto e pesquisa'
    );
  }

  // Validar qualidade score
  if (input.qualidadeScore !== undefined) {
    if (input.qualidadeScore < 0 || input.qualidadeScore > 100) {
      throw new Error('Qualidade score deve estar entre 0 e 100');
    }
  }

  const [novoContexto] = await db
    .insert(fato_entidade_contexto)
    .values({
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return novoContexto;
}

/**
 * Buscar contexto por ID
 */
export async function getContextoById(id: number, incluirDeletados = false) {
  const conditions = [eq(fato_entidade_contexto.id, id)];

  if (!incluirDeletados) {
    conditions.push(isNull(fato_entidade_contexto.deletedAt));
  }

  const [contexto] = await db
    .select()
    .from(fato_entidade_contexto)
    .where(and(...conditions))
    .limit(1);

  return contexto || null;
}

/**
 * Buscar contextos com filtros e paginação
 */
export async function getContextos(
  filters: ContextoFilters = {}
): Promise<ResultadoPaginado<typeof fato_entidade_contexto.$inferSelect>> {
  const {
    entidadeId,
    projetoId,
    pesquisaId,
    geografiaId,
    mercadoId,
    statusQualificacaoId,
    qualidadeScoreMin,
    qualidadeScoreMax,
    orderBy = 'created_at',
    orderDirection = 'desc',
    page = 1,
    limit = 50,
    incluirDeletados = false,
  } = filters;

  // Construir condições WHERE
  const conditions = [];

  if (!incluirDeletados) {
    conditions.push(isNull(fato_entidade_contexto.deletedAt));
  }

  if (entidadeId) {
    conditions.push(eq(fato_entidade_contexto.entidadeId, entidadeId));
  }

  if (projetoId) {
    conditions.push(eq(fato_entidade_contexto.projetoId, projetoId));
  }

  if (pesquisaId) {
    conditions.push(eq(fato_entidade_contexto.pesquisaId, pesquisaId));
  }

  if (geografiaId) {
    conditions.push(eq(fato_entidade_contexto.geografiaId, geografiaId));
  }

  if (mercadoId) {
    conditions.push(eq(fato_entidade_contexto.mercadoId, mercadoId));
  }

  if (statusQualificacaoId) {
    conditions.push(eq(fato_entidade_contexto.statusQualificacaoId, statusQualificacaoId));
  }

  if (qualidadeScoreMin !== undefined) {
    conditions.push(sql`${fato_entidade_contexto.qualidadeScore} >= ${qualidadeScoreMin}`);
  }

  if (qualidadeScoreMax !== undefined) {
    conditions.push(sql`${fato_entidade_contexto.qualidadeScore} <= ${qualidadeScoreMax}`);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Contar total
  const [{ total }] = await db
    .select({ total: count() })
    .from(fato_entidade_contexto)
    .where(whereClause);

  // Buscar dados com paginação
  const offset = (page - 1) * limit;
  const orderColumn =
    getOrderColumn(fato_entidade_contexto, orderBy, fato_entidade_contexto.createdAt);
  const orderFn = orderDirection === 'asc' ? asc : desc;

  const data = await db
    .select()
    .from(fato_entidade_contexto)
    .where(whereClause)
    .orderBy(orderFn(orderColumn))
    .limit(limit)
    .offset(offset);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Atualizar contexto
 */
export async function updateContexto(id: number, input: UpdateContextoInput) {
  // Verificar se contexto existe
  const contextoExistente = await getContextoById(id);
  if (!contextoExistente) {
    throw new Error(`Contexto com ID ${id} não encontrado`);
  }

  // Validar qualidade score
  if (input.qualidadeScore !== undefined) {
    if (input.qualidadeScore < 0 || input.qualidadeScore > 100) {
      throw new Error('Qualidade score deve estar entre 0 e 100');
    }
  }

  const [contextoAtualizado] = await db
    .update(fato_entidade_contexto)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(fato_entidade_contexto.id, id))
    .returning();

  return contextoAtualizado;
}

/**
 * Deletar contexto (soft delete)
 */
export async function deleteContexto(id: number, deletedBy?: string) {
  const [contextoDeletado] = await db
    .update(fato_entidade_contexto)
    .set({
      deletedAt: new Date(),
      deletedBy,
      updatedAt: new Date(),
    })
    .where(eq(fato_entidade_contexto.id, id))
    .returning();

  return contextoDeletado;
}

// ============================================================================
// BUSINESS LOGIC
// ============================================================================

/**
 * Buscar contexto completo com JOINs (entidade, geografia, mercado, etc)
 */
export async function getContextoCompleto(id: number) {
  const [resultado] = await db
    .select({
      contexto: fato_entidade_contexto,
      entidade: dim_entidade,
      projeto: dim_projeto,
      pesquisa: dim_pesquisa,
      geografia: dim_geografia,
      mercado: dim_mercado,
      statusQualificacao: dim_status_qualificacao,
    })
    .from(fato_entidade_contexto)
    .leftJoin(dim_entidade, eq(fato_entidade_contexto.entidadeId, dim_entidade.id))
    .leftJoin(dim_projeto, eq(fato_entidade_contexto.projetoId, dim_projeto.id))
    .leftJoin(dim_pesquisa, eq(fato_entidade_contexto.pesquisaId, dim_pesquisa.id))
    .leftJoin(dim_geografia, eq(fato_entidade_contexto.geografiaId, dim_geografia.id))
    .leftJoin(dim_mercado, eq(fato_entidade_contexto.mercadoId, dim_mercado.id))
    .leftJoin(
      dim_status_qualificacao,
      eq(fato_entidade_contexto.statusQualificacaoId, dim_status_qualificacao.id)
    )
    .where(eq(fato_entidade_contexto.id, id))
    .limit(1);

  return resultado || null;
}

/**
 * Buscar contextos por entidade
 */
export async function getContextosByEntidade(entidadeId: number) {
  return getContextos({ entidadeId });
}

/**
 * Buscar contextos por pesquisa
 */
export async function getContextosByPesquisa(pesquisaId: number) {
  return getContextos({ pesquisaId });
}

/**
 * Buscar contexto por entidade + projeto + pesquisa
 */
async function getContextoByEntidadeProjetoPesquisa(
  entidadeId: number,
  projetoId: number,
  pesquisaId: number
) {
  const [contexto] = await db
    .select()
    .from(fato_entidade_contexto)
    .where(
      and(
        eq(fato_entidade_contexto.entidadeId, entidadeId),
        eq(fato_entidade_contexto.projetoId, projetoId),
        eq(fato_entidade_contexto.pesquisaId, pesquisaId),
        isNull(fato_entidade_contexto.deletedAt)
      )
    )
    .limit(1);

  return contexto || null;
}

/**
 * Calcular qualidade score baseado nos dados do contexto
 */
export function calcularQualidadeScore(contexto: typeof fato_entidade_contexto.$inferSelect): number {
  let score = 0;
  let checks = 0;

  // Geografia preenchida (20 pontos)
  if (contexto.geografiaId) {
    score += 20;
  }
  checks++;

  // Mercado preenchido (20 pontos)
  if (contexto.mercadoId) {
    score += 20;
  }
  checks++;

  // CNAE preenchido (15 pontos)
  if (contexto.cnae) {
    score += 15;
  }
  checks++;

  // Porte preenchido (15 pontos)
  if (contexto.porte) {
    score += 15;
  }
  checks++;

  // Faturamento estimado (15 pontos)
  if (contexto.faturamentoEstimado) {
    score += 15;
  }
  checks++;

  // Número de funcionários (15 pontos)
  if (contexto.numFuncionarios) {
    score += 15;
  }
  checks++;

  return Math.min(100, Math.round(score));
}

/**
 * Atualizar qualidade score do contexto
 */
export async function atualizarQualidadeScore(id: number, updatedBy?: string) {
  const contexto = await getContextoById(id);
  if (!contexto) {
    throw new Error(`Contexto com ID ${id} não encontrado`);
  }

  const novoScore = calcularQualidadeScore(contexto);

  let classificacao = 'baixa';
  if (novoScore >= 80) {
    classificacao = 'alta';
  } else if (novoScore >= 50) {
    classificacao = 'media';
  }

  return updateContexto(id, {
    qualidadeScore: novoScore,
    qualidadeClassificacao: classificacao,
    updatedBy,
  });
}

/**
 * Contar contextos por status de qualificação
 */
export async function contarContextosPorStatus(pesquisaId?: number) {
  const conditions = [isNull(fato_entidade_contexto.deletedAt)];

  if (pesquisaId) {
    conditions.push(eq(fato_entidade_contexto.pesquisaId, pesquisaId));
  }

  const resultados = await db
    .select({
      statusQualificacaoId: fato_entidade_contexto.statusQualificacaoId,
      total: count(),
    })
    .from(fato_entidade_contexto)
    .where(and(...conditions))
    .groupBy(fato_entidade_contexto.statusQualificacaoId);

  return resultados;
}

/**
 * Calcular qualidade média de uma pesquisa
 */
export async function calcularQualidadeMediaPesquisa(pesquisaId: number): Promise<number> {
  const [resultado] = await db
    .select({
      media: sql<number>`AVG(${fato_entidade_contexto.qualidadeScore})`,
    })
    .from(fato_entidade_contexto)
    .where(
      and(
        eq(fato_entidade_contexto.pesquisaId, pesquisaId),
        isNull(fato_entidade_contexto.deletedAt)
      )
    );

  return resultado?.media ? Math.round(resultado.media) : 0;
}
