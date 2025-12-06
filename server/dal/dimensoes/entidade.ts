/**
 * DAL para dim_entidade
 * Sincronizado 100% com schema (49 campos)
 */

import { db } from '../../db';
import { dim_entidade } from '../../../drizzle';
import { eq, and, isNull, desc, asc, sql, like } from 'drizzle-orm';

// ============================================================================
// TIPOS
// ============================================================================

export interface EntidadeFilters {
  id?: number;
  entidade_hash?: string;
  tipo_entidade?: string;
  nome?: string;
  cnpj?: string;
  email?: string;
  cidade?: string;
  uf?: string;
  porte?: string;
  setor?: string;
  segmentacao_b2b_b2c?: string;
  status_qualificacao_id?: number;
  enriquecido?: boolean;
  incluirInativos?: boolean;
  orderBy?: keyof typeof dim_entidade;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateEntidadeData {
  entidade_hash: string;
  tipo_entidade: string;
  nome: string;
  nome_fantasia?: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  site?: string;
  num_filiais?: number;
  num_lojas?: number;
  num_funcionarios?: number;
  origem_tipo: string;
  origem_arquivo?: string;
  origem_processo?: string;
  origem_prompt?: string;
  origem_confianca?: number;
  origem_data: Date;
  origem_usuario_id?: number;
  created_by?: string;
  importacao_id?: number;
  cnpj_hash?: string;
  cpf_hash?: string;
  email_hash?: string;
  telefone_hash?: string;
  cidade?: string;
  uf?: string;
  porte?: string;
  setor?: string;
  produto_principal?: string;
  segmentacao_b2b_b2c?: string;
  score_qualidade?: number;
  enriquecido_em?: Date;
  enriquecido_por?: string;
  cache_hit?: boolean;
  cache_expires_at?: Date;
  score_qualidade_dados?: number;
  validacao_cnpj?: boolean;
  validacao_email?: boolean;
  validacao_telefone?: boolean;
  campos_faltantes?: string;
  ultima_validacao?: Date;
  status_qualificacao_id?: number;
  enriquecido?: boolean;
}

export interface UpdateEntidadeData {
  nome?: string;
  nome_fantasia?: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  site?: string;
  num_filiais?: number;
  num_lojas?: number;
  num_funcionarios?: number;
  updated_by?: string;
  cnpj_hash?: string;
  cpf_hash?: string;
  email_hash?: string;
  telefone_hash?: string;
  cidade?: string;
  uf?: string;
  porte?: string;
  setor?: string;
  produto_principal?: string;
  segmentacao_b2b_b2c?: string;
  score_qualidade?: number;
  enriquecido_em?: Date;
  enriquecido_por?: string;
  cache_hit?: boolean;
  cache_expires_at?: Date;
  score_qualidade_dados?: number;
  validacao_cnpj?: boolean;
  validacao_email?: boolean;
  validacao_telefone?: boolean;
  campos_faltantes?: string;
  ultima_validacao?: Date;
  status_qualificacao_id?: number;
  enriquecido?: boolean;
}

// ============================================================================
// FUNÇÕES CRUD
// ============================================================================

export async function getEntidades(filters: EntidadeFilters = {}) {
  const conditions: any[] = [];

  if (filters.id) {
    conditions.push(eq(dim_entidade.id, filters.id));
  }
  if (filters.entidade_hash) {
    conditions.push(eq(dim_entidade.entidade_hash, filters.entidade_hash));
  }
  if (filters.tipo_entidade) {
    conditions.push(eq(dim_entidade.tipo_entidade, filters.tipo_entidade));
  }
  if (filters.nome) {
    conditions.push(like(dim_entidade.nome, `%${filters.nome}%`));
  }
  if (filters.cnpj) {
    conditions.push(eq(dim_entidade.cnpj, filters.cnpj));
  }
  if (filters.email) {
    conditions.push(eq(dim_entidade.email, filters.email));
  }
  if (filters.cidade) {
    conditions.push(eq(dim_entidade.cidade, filters.cidade));
  }
  if (filters.uf) {
    conditions.push(eq(dim_entidade.uf, filters.uf));
  }
  if (filters.porte) {
    conditions.push(eq(dim_entidade.porte, filters.porte));
  }
  if (filters.setor) {
    conditions.push(eq(dim_entidade.setor, filters.setor));
  }
  if (filters.segmentacao_b2b_b2c) {
    conditions.push(eq(dim_entidade.segmentacao_b2b_b2c, filters.segmentacao_b2b_b2c));
  }
  if (filters.status_qualificacao_id) {
    conditions.push(eq(dim_entidade.status_qualificacao_id, filters.status_qualificacao_id));
  }
  if (filters.enriquecido !== undefined) {
    conditions.push(eq(dim_entidade.enriquecido, filters.enriquecido));
  }

  // Soft delete
  if (!filters.incluirInativos) {
    conditions.push(isNull(dim_entidade.deleted_at));
  }

  let query = db
    .select()
    .from(dim_entidade)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  // Ordenação
  if (filters.orderBy) {
    const orderColumn = dim_entidade[filters.orderBy];
    if (orderColumn) {
      query = query.orderBy(
        filters.orderDirection === 'desc' ? desc(orderColumn) : asc(orderColumn)
      ) as any;
    }
  } else {
    query = query.orderBy(desc(dim_entidade.created_at)) as any;
  }

  // Paginação
  if (filters.limit) {
    query = query.limit(filters.limit) as any;
  }
  if (filters.offset) {
    query = query.offset(filters.offset) as any;
  }

  return query;
}

export async function getEntidadeById(id: number) {
  const result = await db
    .select()
    .from(dim_entidade)
    .where(and(eq(dim_entidade.id, id), isNull(dim_entidade.deleted_at)))
    .limit(1);

  return result[0] || null;
}

export async function getEntidadeByHash(hash: string) {
  const result = await db
    .select()
    .from(dim_entidade)
    .where(and(eq(dim_entidade.entidade_hash, hash), isNull(dim_entidade.deleted_at)))
    .limit(1);

  return result[0] || null;
}

export async function getEntidadeByCNPJ(cnpj: string) {
  const result = await db
    .select()
    .from(dim_entidade)
    .where(and(eq(dim_entidade.cnpj, cnpj), isNull(dim_entidade.deleted_at)))
    .limit(1);

  return result[0] || null;
}

export async function createEntidade(data: CreateEntidadeData) {
  const result = await db
    .insert(dim_entidade)
    .values({
      ...data,
      created_at: sql`now()`,
      updated_at: sql`now()`,
    })
    .returning();

  return result[0];
}

export async function updateEntidade(id: number, data: UpdateEntidadeData) {
  const result = await db
    .update(dim_entidade)
    .set({
      ...data,
      updated_at: sql`now()`,
    })
    .where(eq(dim_entidade.id, id))
    .returning();

  return result[0] || null;
}

export async function deleteEntidade(id: number, deleted_by?: string) {
  const result = await db
    .update(dim_entidade)
    .set({
      deleted_at: sql`now()`,
      deleted_by,
    })
    .where(eq(dim_entidade.id, id))
    .returning();

  return result[0] || null;
}

export async function countEntidades(filters: EntidadeFilters = {}) {
  const conditions: any[] = [];

  if (filters.tipo_entidade) {
    conditions.push(eq(dim_entidade.tipo_entidade, filters.tipo_entidade));
  }
  if (filters.cidade) {
    conditions.push(eq(dim_entidade.cidade, filters.cidade));
  }
  if (filters.uf) {
    conditions.push(eq(dim_entidade.uf, filters.uf));
  }
  if (filters.enriquecido !== undefined) {
    conditions.push(eq(dim_entidade.enriquecido, filters.enriquecido));
  }

  if (!filters.incluirInativos) {
    conditions.push(isNull(dim_entidade.deleted_at));
  }

  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(dim_entidade)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return result[0]?.count || 0;
}

/**
 * Sugerir entidades duplicadas para merge
 * Busca entidades similares baseado em CNPJ, nome ou email
 */
export async function sugerirMerge(entidade: any) {
  const conditions = [];

  // Buscar por CNPJ igual (se existir)
  if (entidade.cnpj) {
    const porCNPJ = await db
      .select()
      .from(dim_entidade)
      .where(
        and(
          eq(dim_entidade.cnpj, entidade.cnpj),
          isNull(dim_entidade.deleted_at)
        )
      )
      .limit(10);
    
    if (porCNPJ.length > 1) {
      return porCNPJ.filter(e => e.id !== entidade.id);
    }
  }

  // Buscar por nome similar (se não encontrou por CNPJ)
  if (entidade.nome) {
    const porNome = await db
      .select()
      .from(dim_entidade)
      .where(
        and(
          like(dim_entidade.nome, `%${entidade.nome}%`),
          isNull(dim_entidade.deleted_at)
        )
      )
      .limit(10);
    
    if (porNome.length > 1) {
      return porNome.filter(e => e.id !== entidade.id);
    }
  }

  // Buscar por email igual (se não encontrou por nome)
  if (entidade.email) {
    const porEmail = await db
      .select()
      .from(dim_entidade)
      .where(
        and(
          eq(dim_entidade.email, entidade.email),
          isNull(dim_entidade.deleted_at)
        )
      )
      .limit(10);
    
    if (porEmail.length > 1) {
      return porEmail.filter(e => e.id !== entidade.id);
    }
  }

  // Não encontrou duplicatas
  return [];
}
