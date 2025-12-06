/**
 * Data Access Layer (DAL) para Entidades
 * Camada de abstração para acesso unificado a fato_entidade_contexto
 * 
 * VERSÃO CORRIGIDA - Usando nomes corretos do schema
 */

iimport { db } from '../db';
import { getOrderColumn } from '../helpers/order-by';';
import {
  fatoEntidadeContexto,    // ✅ CORRETO (era fatoEntidades)
  dimEntidade,             // ✅ CORRETO
  dimGeografia,            // ✅ CORRETO (sem maiúscula)
  dimMercado,              // ✅ CORRETO (singular, era dimMercados)
  dimProduto,              // ✅ CORRETO (singular, era dimProdutos)
  dimStatusQualificacao,   // ✅ CORRETO
  fatoEntidadeProduto,     // ✅ CORRETO (era entidadeProdutos)
  fatoEntidadeCompetidor,  // ✅ CORRETO (era entidadeCompetidores)
} from '../../drizzle/schema';
import { eq, and, or, inArray, gte, lte, like, sql, desc, asc, count } from 'drizzle-orm';

// ============================================================================
// TIPOS
// ============================================================================

export type TipoEntidade = 'cliente' | 'lead' | 'concorrente';

export interface FiltrosEntidade {
  tipo_entidade?: TipoEntidade | TipoEntidade[];
  pesquisa_id?: number;
  projeto_id?: number;
  status_qualificacao_id?: number;
  geografia_id?: number;
  mercado_id?: number;
  regiao?: string;
  uf?: string;
  cidade?: string;
  qualidade_min?: number;
  qualidade_max?: number;
  qualidade_classificacao?: string | string[];
  busca?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
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
// FUNÇÕES DE QUERY UNIFICADAS
// ============================================================================

/**
 * Buscar contextos de entidades com filtros e paginação
 */
export async function getContextosEntidades(
  filtros: FiltrosEntidade = {}
): Promise<ResultadoPaginado<any>> {
  const {
    tipo_entidade,
    pesquisa_id,
    projeto_id,
    status_qualificacao_id,
    geografia_id,
    mercado_id,
    qualidade_min,
    qualidade_max,
    qualidade_classificacao,
    busca,
    orderBy = 'created_at',
    orderDirection = 'desc',
    page = 1,
    limit = 50,
  } = filtros;

  // Construir condições WHERE
  const conditions = [];

  if (tipo_entidade) {
    if (Array.isArray(tipo_entidade)) {
      conditions.push(inArray(fatoEntidadeContexto.tipoEntidade, tipo_entidade));
    } else {
      conditions.push(eq(fatoEntidadeContexto.tipoEntidade, tipo_entidade));
    }
  }

  if (pesquisa_id) {
    conditions.push(eq(fatoEntidadeContexto.pesquisaId, pesquisa_id));
  }

  if (projeto_id) {
    conditions.push(eq(fatoEntidadeContexto.projetoId, projeto_id));
  }

  if (status_qualificacao_id) {
    conditions.push(eq(fatoEntidadeContexto.statusQualificacaoId, status_qualificacao_id));
  }

  if (geografia_id) {
    conditions.push(eq(fatoEntidadeContexto.geografiaId, geografia_id));
  }

  if (mercado_id) {
    conditions.push(eq(fatoEntidadeContexto.mercadoId, mercado_id));
  }

  if (qualidade_min !== undefined) {
    conditions.push(gte(fatoEntidadeContexto.qualidadeScore, qualidade_min));
  }

  if (qualidade_max !== undefined) {
    conditions.push(lte(fatoEntidadeContexto.qualidadeScore, qualidade_max));
  }

  if (qualidade_classificacao) {
    if (Array.isArray(qualidade_classificacao)) {
      conditions.push(inArray(fatoEntidadeContexto.qualidadeClassificacao, qualidade_classificacao));
    } else {
      conditions.push(eq(fatoEntidadeContexto.qualidadeClassificacao, qualidade_classificacao));
    }
  }

  // Busca textual (precisa JOIN com dim_entidade)
  if (busca) {
    // TODO: Implementar JOIN com dim_entidade para buscar por nome/cnpj
    // Por enquanto, vamos buscar apenas no contexto
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Contar total
  const [{ total }] = await db
    .select({ total: count() })
    .from(fatoEntidadeContexto)
    .where(whereClause);

  // Buscar dados com paginação
  const offset = (page - 1) * limit;
  const orderColumn = getOrderColumn(fatoEntidadeContexto, orderBy, fatoEntidadeContexto.createdAt);
  const orderFn = orderDirection === 'asc' ? asc : desc;

  const data = await db
    .select()
    .from(fatoEntidadeContexto)
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

// ============================================================================
// WRAPPERS ESPECIALIZADOS
// ============================================================================

/**
 * Buscar apenas clientes
 */
export async function getClientes(
  filtros: Omit<FiltrosEntidade, 'tipo_entidade'> = {}
): Promise<ResultadoPaginado<any>> {
  return getContextosEntidades({
    ...filtros,
    tipo_entidade: 'cliente',
  });
}

/**
 * Buscar apenas leads
 */
export async function getLeads(
  filtros: Omit<FiltrosEntidade, 'tipo_entidade'> = {}
): Promise<ResultadoPaginado<any>> {
  return getContextosEntidades({
    ...filtros,
    tipo_entidade: 'lead',
  });
}

/**
 * Buscar apenas concorrentes
 */
export async function getConcorrentes(
  filtros: Omit<FiltrosEntidade, 'tipo_entidade'> = {}
): Promise<ResultadoPaginado<any>> {
  return getContextosEntidades({
    ...filtros,
    tipo_entidade: 'concorrente',
  });
}

// ============================================================================
// BUSCAR POR ID
// ============================================================================

/**
 * Buscar contexto por ID
 */
export async function getContextoById(id: number): Promise<any | null> {
  const [contexto] = await db
    .select()
    .from(fatoEntidadeContexto)
    .where(eq(fatoEntidadeContexto.id, id))
    .limit(1);

  return contexto || null;
}

/**
 * Buscar contexto completo (com todas as dimensões e relacionamentos)
 */
export async function getContextoCompleto(id: number): Promise<any | null> {
  const contexto = await getContextoById(id);
  if (!contexto) return null;

  // Buscar entidade
  const [entidade] = await db
    .select()
    .from(dimEntidade)
    .where(eq(dimEntidade.id, contexto.entidadeId))
    .limit(1);

  // Buscar geografia
  const [geografia] = contexto.geografiaId
    ? await db
        .select()
        .from(dimGeografia)
        .where(eq(dimGeografia.id, contexto.geografiaId))
        .limit(1)
    : [null];

  // Buscar mercado
  const [mercado] = contexto.mercadoId
    ? await db
        .select()
        .from(dimMercado)
        .where(eq(dimMercado.id, contexto.mercadoId))
        .limit(1)
    : [null];

  // Buscar status qualificação
  const [statusQualificacao] = contexto.statusQualificacaoId
    ? await db
        .select()
        .from(dimStatusQualificacao)
        .where(eq(dimStatusQualificacao.id, contexto.statusQualificacaoId))
        .limit(1)
    : [null];

  // Buscar produtos relacionados
  const produtosRelacionados = await db
    .select({
      produto: dimProduto,
      relacao: fatoEntidadeProduto,
    })
    .from(fatoEntidadeProduto)
    .innerJoin(dimProduto, eq(dimProduto.id, fatoEntidadeProduto.produtoId))
    .where(eq(fatoEntidadeProduto.contextoId, id));

  // Buscar concorrentes relacionados
  const concorrentesRelacionados = await db
    .select({
      entidade: dimEntidade,
      relacao: fatoEntidadeCompetidor,
    })
    .from(fatoEntidadeCompetidor)
    .innerJoin(dimEntidade, eq(dimEntidade.id, fatoEntidadeCompetidor.competidorEntidadeId))
    .where(eq(fatoEntidadeCompetidor.contextoId, id));

  return {
    ...contexto,
    entidade,
    geografia,
    mercado,
    statusQualificacao,
    produtos: produtosRelacionados.map((p) => ({
      ...p.produto,
      tipoRelacao: p.relacao.tipoRelacao,
      volumeEstimado: p.relacao.volumeEstimado,
      observacoes: p.relacao.observacoes,
    })),
    concorrentes: concorrentesRelacionados.map((c) => ({
      ...c.entidade,
      nivelCompeticao: c.relacao.nivelCompeticao,
      observacoes: c.relacao.observacoes,
    })),
  };
}

// ============================================================================
// CRIAR E ATUALIZAR
// ============================================================================

/**
 * Criar novo contexto de entidade
 */
export async function criarContexto(input: any): Promise<any> {
  const [novoContexto] = await db
    .insert(fatoEntidadeContexto)
    .values({
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return novoContexto;
}

/**
 * Atualizar contexto existente
 */
export async function atualizarContexto(id: number, input: any): Promise<any | null> {
  const [contextoAtualizado] = await db
    .update(fatoEntidadeContexto)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(fatoEntidadeContexto.id, id))
    .returning();

  return contextoAtualizado || null;
}

/**
 * Deletar contexto (soft delete)
 */
export async function deletarContexto(id: number, deletedBy?: number): Promise<boolean> {
  const resultado = await atualizarContexto(id, {
    deletedAt: new Date(),
    deletedBy,
  });

  return resultado !== null;
}

// ============================================================================
// ESTATÍSTICAS
// ============================================================================

/**
 * Obter estatísticas gerais de contextos
 */
export async function getEstatisticasContextos(pesquisa_id?: number): Promise<any> {
  const whereClause = pesquisa_id
    ? eq(fatoEntidadeContexto.pesquisaId, pesquisa_id)
    : undefined;

  const [stats] = await db
    .select({
      total: count(),
      clientes: sql<number>`COUNT(*) FILTER (WHERE ${fatoEntidadeContexto.tipoEntidade} = 'cliente')`,
      leads: sql<number>`COUNT(*) FILTER (WHERE ${fatoEntidadeContexto.tipoEntidade} = 'lead')`,
      concorrentes: sql<number>`COUNT(*) FILTER (WHERE ${fatoEntidadeContexto.tipoEntidade} = 'concorrente')`,
      qualidade_a: sql<number>`COUNT(*) FILTER (WHERE ${fatoEntidadeContexto.qualidadeClassificacao} = 'A')`,
      qualidade_b: sql<number>`COUNT(*) FILTER (WHERE ${fatoEntidadeContexto.qualidadeClassificacao} = 'B')`,
      qualidade_c: sql<number>`COUNT(*) FILTER (WHERE ${fatoEntidadeContexto.qualidadeClassificacao} = 'C')`,
      qualidade_d: sql<number>`COUNT(*) FILTER (WHERE ${fatoEntidadeContexto.qualidadeClassificacao} = 'D')`,
      qualidade_media: sql<number>`AVG(${fatoEntidadeContexto.qualidadeScore})`,
    })
    .from(fatoEntidadeContexto)
    .where(whereClause);

  return {
    total: stats.total,
    por_tipo: {
      cliente: stats.clientes,
      lead: stats.leads,
      concorrente: stats.concorrentes,
    },
    por_qualidade: {
      A: stats.qualidade_a,
      B: stats.qualidade_b,
      C: stats.qualidade_c,
      D: stats.qualidade_d,
    },
    qualidade_media: Math.round(stats.qualidade_media || 0),
  };
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Buscar entidade por CNPJ
 */
export async function buscarEntidadePorCNPJ(cnpj: string): Promise<any | null> {
  const [entidade] = await db
    .select()
    .from(dimEntidade)
    .where(eq(dimEntidade.cnpj, cnpj))
    .limit(1);

  return entidade || null;
}

/**
 * Buscar ou criar entidade
 */
export async function buscarOuCriarEntidade(input: any): Promise<{ entidade: any; criada: boolean }> {
  // Se tem CNPJ, buscar por CNPJ
  if (input.cnpj) {
    const existente = await buscarEntidadePorCNPJ(input.cnpj);
    if (existente) {
      return { entidade: existente, criada: false };
    }
  }

  // Se não encontrou, criar nova
  const [nova] = await db.insert(dimEntidade).values(input).returning();
  return { entidade: nova, criada: true };
}
