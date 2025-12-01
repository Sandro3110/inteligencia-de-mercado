/**
 * Data Access Layer (DAL) para Entidades
 * Camada de abstração para acesso unificado a fato_entidades
 */

import { db } from '../db';
import {
  fatoEntidades,
  dimGeografia,
  dimMercados,
  dimProdutos,
  entidadeProdutos,
  entidadeCompetidores,
} from '../../drizzle/schema';
import { eq, and, or, inArray, gte, lte, like, sql, desc, asc, count } from 'drizzle-orm';
import type {
  FatoEntidade,
  Cliente,
  Lead,
  Concorrente,
  FiltrosEntidade,
  ResultadoPaginado,
  CriarEntidadeInput,
  AtualizarEntidadeInput,
  EntidadeCompleta,
  EstatisticasEntidades,
  TipoEntidade,
} from '../../shared/types/entidades';
import { createHash } from 'crypto';

// ============================================================================
// FUNÇÕES DE QUERY UNIFICADAS
// ============================================================================

/**
 * Buscar entidades com filtros e paginação
 */
export async function getEntidades(
  filtros: FiltrosEntidade = {}
): Promise<ResultadoPaginado<FatoEntidade>> {
  const {
    tipo_entidade,
    pesquisa_id,
    project_id,
    status_qualificacao,
    geografia_id,
    mercado_id,
    regiao,
    uf,
    cidade,
    categoria_mercado,
    qualidade_min,
    qualidade_max,
    qualidade_classificacao,
    validation_status,
    lead_stage,
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
      conditions.push(inArray(fatoEntidades.tipo_entidade, tipo_entidade));
    } else {
      conditions.push(eq(fatoEntidades.tipo_entidade, tipo_entidade));
    }
  }

  if (pesquisa_id) {
    conditions.push(eq(fatoEntidades.pesquisa_id, pesquisa_id));
  }

  if (project_id) {
    conditions.push(eq(fatoEntidades.project_id, project_id));
  }

  if (status_qualificacao) {
    if (Array.isArray(status_qualificacao)) {
      conditions.push(inArray(fatoEntidades.status_qualificacao, status_qualificacao));
    } else {
      conditions.push(eq(fatoEntidades.status_qualificacao, status_qualificacao));
    }
  }

  if (geografia_id) {
    conditions.push(eq(fatoEntidades.geografia_id, geografia_id));
  }

  if (mercado_id) {
    conditions.push(eq(fatoEntidades.mercado_id, mercado_id));
  }

  if (qualidade_min !== undefined) {
    conditions.push(gte(fatoEntidades.qualidade_score, qualidade_min));
  }

  if (qualidade_max !== undefined) {
    conditions.push(lte(fatoEntidades.qualidade_score, qualidade_max));
  }

  if (qualidade_classificacao) {
    if (Array.isArray(qualidade_classificacao)) {
      conditions.push(inArray(fatoEntidades.qualidade_classificacao, qualidade_classificacao));
    } else {
      conditions.push(eq(fatoEntidades.qualidade_classificacao, qualidade_classificacao));
    }
  }

  if (validation_status) {
    if (Array.isArray(validation_status)) {
      conditions.push(inArray(fatoEntidades.validation_status, validation_status));
    } else {
      conditions.push(eq(fatoEntidades.validation_status, validation_status));
    }
  }

  if (lead_stage) {
    if (Array.isArray(lead_stage)) {
      conditions.push(inArray(fatoEntidades.lead_stage, lead_stage));
    } else {
      conditions.push(eq(fatoEntidades.lead_stage, lead_stage));
    }
  }

  if (busca) {
    conditions.push(
      or(
        like(fatoEntidades.nome, `%${busca}%`),
        like(fatoEntidades.cnpj, `%${busca}%`),
        like(fatoEntidades.email, `%${busca}%`)
      )
    );
  }

  // Filtros que requerem JOIN
  if (regiao || uf || cidade || categoria_mercado) {
    // TODO: Implementar JOINs para esses filtros
    // Por enquanto, vamos buscar sem esses filtros
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Contar total
  const [{ total }] = await db.select({ total: count() }).from(fatoEntidades).where(whereClause);

  // Buscar dados com paginação
  const offset = (page - 1) * limit;
  const orderColumn = fatoEntidades[orderBy] || fatoEntidades.created_at;
  const orderFn = orderDirection === 'asc' ? asc : desc;

  const data = await db
    .select()
    .from(fatoEntidades)
    .where(whereClause)
    .orderBy(orderFn(orderColumn))
    .limit(limit)
    .offset(offset);

  const totalPages = Math.ceil(total / limit);

  return {
    data: data as FatoEntidade[],
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
): Promise<ResultadoPaginado<Cliente>> {
  const resultado = await getEntidades({
    ...filtros,
    tipo_entidade: 'cliente',
  });

  return {
    ...resultado,
    data: resultado.data as Cliente[],
  };
}

/**
 * Buscar apenas leads
 */
export async function getLeads(
  filtros: Omit<FiltrosEntidade, 'tipo_entidade'> = {}
): Promise<ResultadoPaginado<Lead>> {
  const resultado = await getEntidades({
    ...filtros,
    tipo_entidade: 'lead',
  });

  return {
    ...resultado,
    data: resultado.data as Lead[],
  };
}

/**
 * Buscar apenas concorrentes
 */
export async function getConcorrentes(
  filtros: Omit<FiltrosEntidade, 'tipo_entidade'> = {}
): Promise<ResultadoPaginado<Concorrente>> {
  const resultado = await getEntidades({
    ...filtros,
    tipo_entidade: 'concorrente',
  });

  return {
    ...resultado,
    data: resultado.data as Concorrente[],
  };
}

// ============================================================================
// BUSCAR POR ID
// ============================================================================

/**
 * Buscar entidade por ID
 */
export async function getEntidadeById(id: number): Promise<FatoEntidade | null> {
  const [entidade] = await db.select().from(fatoEntidades).where(eq(fatoEntidades.id, id)).limit(1);

  return (entidade as FatoEntidade) || null;
}

/**
 * Buscar entidade completa (com todas as dimensões e relacionamentos)
 */
export async function getEntidadeCompleta(id: number): Promise<EntidadeCompleta | null> {
  const entidade = await getEntidadeById(id);
  if (!entidade) return null;

  // Buscar geografia
  const [geografia] = await db
    .select()
    .from(dimGeografia)
    .where(eq(dimGeografia.id, entidade.geografia_id))
    .limit(1);

  // Buscar mercado
  const [mercado] = await db
    .select()
    .from(dimMercados)
    .where(eq(dimMercados.id, entidade.mercado_id))
    .limit(1);

  // Buscar produtos
  const produtosRelacionados = await db
    .select({
      ...dimProdutos,
      tipo_relacao: entidadeProdutos.tipo_relacao,
    })
    .from(entidadeProdutos)
    .innerJoin(dimProdutos, eq(dimProdutos.id, entidadeProdutos.produto_id))
    .where(eq(entidadeProdutos.entidade_id, id));

  // Buscar concorrentes
  const concorrentesRelacionados = await db
    .select({
      ...fatoEntidades,
      nivel_competicao: entidadeCompetidores.nivel_competicao,
    })
    .from(entidadeCompetidores)
    .innerJoin(fatoEntidades, eq(fatoEntidades.id, entidadeCompetidores.competidor_id))
    .where(eq(entidadeCompetidores.entidade_id, id));

  return {
    ...entidade,
    geografia,
    mercado,
    produtos: produtosRelacionados,
    concorrentes: concorrentesRelacionados,
  } as EntidadeCompleta;
}

// ============================================================================
// CRIAR E ATUALIZAR
// ============================================================================

/**
 * Gerar hash único para entidade
 */
function gerarEntidadeHash(input: CriarEntidadeInput): string {
  const chave = input.cnpj ? input.cnpj : `${input.nome}-${input.geografia_id}-${input.mercado_id}`;

  return createHash('md5').update(chave).digest('hex');
}

/**
 * Criar nova entidade
 */
export async function criarEntidade(input: CriarEntidadeInput): Promise<FatoEntidade> {
  const entidade_hash = input.entidade_hash || gerarEntidadeHash(input);

  const [novaEntidade] = await db
    .insert(fatoEntidades)
    .values({
      ...input,
      entidade_hash,
      status_qualificacao: input.status_qualificacao || 'prospect',
      created_at: new Date(),
      updated_at: new Date(),
    })
    .returning();

  return novaEntidade as FatoEntidade;
}

/**
 * Atualizar entidade existente
 */
export async function atualizarEntidade(
  id: number,
  input: AtualizarEntidadeInput
): Promise<FatoEntidade | null> {
  const [entidadeAtualizada] = await db
    .update(fatoEntidades)
    .set({
      ...input,
      updated_at: new Date(),
    })
    .where(eq(fatoEntidades.id, id))
    .returning();

  return (entidadeAtualizada as FatoEntidade) || null;
}

/**
 * Deletar entidade (soft delete - marcar como inativo)
 */
export async function deletarEntidade(id: number): Promise<boolean> {
  const resultado = await atualizarEntidade(id, {
    status_qualificacao: 'inativo',
  });

  return resultado !== null;
}

// ============================================================================
// ESTATÍSTICAS
// ============================================================================

/**
 * Obter estatísticas gerais de entidades
 */
export async function getEstatisticasEntidades(
  pesquisa_id?: number
): Promise<EstatisticasEntidades> {
  const whereClause = pesquisa_id ? eq(fatoEntidades.pesquisa_id, pesquisa_id) : undefined;

  const [stats] = await db
    .select({
      total: count(),
      clientes: sql<number>`COUNT(*) FILTER (WHERE ${fatoEntidades.tipo_entidade} = 'cliente')`,
      leads: sql<number>`COUNT(*) FILTER (WHERE ${fatoEntidades.tipo_entidade} = 'lead')`,
      concorrentes: sql<number>`COUNT(*) FILTER (WHERE ${fatoEntidades.tipo_entidade} = 'concorrente')`,
      ativos: sql<number>`COUNT(*) FILTER (WHERE ${fatoEntidades.status_qualificacao} = 'ativo')`,
      inativos: sql<number>`COUNT(*) FILTER (WHERE ${fatoEntidades.status_qualificacao} = 'inativo')`,
      prospects: sql<number>`COUNT(*) FILTER (WHERE ${fatoEntidades.status_qualificacao} = 'prospect')`,
      qualidade_a: sql<number>`COUNT(*) FILTER (WHERE ${fatoEntidades.qualidade_classificacao} = 'A')`,
      qualidade_b: sql<number>`COUNT(*) FILTER (WHERE ${fatoEntidades.qualidade_classificacao} = 'B')`,
      qualidade_c: sql<number>`COUNT(*) FILTER (WHERE ${fatoEntidades.qualidade_classificacao} = 'C')`,
      qualidade_d: sql<number>`COUNT(*) FILTER (WHERE ${fatoEntidades.qualidade_classificacao} = 'D')`,
      qualidade_media: sql<number>`AVG(${fatoEntidades.qualidade_score})`,
      validados: sql<number>`COUNT(*) FILTER (WHERE ${fatoEntidades.validation_status} = 'approved')`,
    })
    .from(fatoEntidades)
    .where(whereClause);

  return {
    total: stats.total,
    por_tipo: {
      cliente: stats.clientes,
      lead: stats.leads,
      concorrente: stats.concorrentes,
    },
    por_status: {
      ativo: stats.ativos,
      inativo: stats.inativos,
      prospect: stats.prospects,
      lead_qualificado: 0, // TODO: adicionar
      lead_desqualificado: 0, // TODO: adicionar
    },
    por_qualidade: {
      A: stats.qualidade_a,
      B: stats.qualidade_b,
      C: stats.qualidade_c,
      D: stats.qualidade_d,
    },
    qualidade_media: Math.round(stats.qualidade_media || 0),
    com_mercado: stats.total, // Todos têm mercado (obrigatório)
    com_produtos: 0, // TODO: contar via JOIN
    com_concorrentes: 0, // TODO: contar via JOIN
    validados: stats.validados,
  };
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Verificar se entidade existe por hash
 */
export async function entidadeExistePorHash(hash: string): Promise<FatoEntidade | null> {
  const [entidade] = await db
    .select()
    .from(fatoEntidades)
    .where(eq(fatoEntidades.entidade_hash, hash))
    .limit(1);

  return (entidade as FatoEntidade) || null;
}

/**
 * Buscar ou criar entidade (upsert)
 */
export async function buscarOuCriarEntidade(
  input: CriarEntidadeInput
): Promise<{ entidade: FatoEntidade; criada: boolean }> {
  const hash = gerarEntidadeHash(input);
  const existente = await entidadeExistePorHash(hash);

  if (existente) {
    return { entidade: existente, criada: false };
  }

  const nova = await criarEntidade({ ...input, entidade_hash: hash });
  return { entidade: nova, criada: true };
}
